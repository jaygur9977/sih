from gvm.connections import TLSConnection
from gvm.protocols.gmp import Gmp
from lxml import etree
import time
import json

# ===========================
# CONFIGURATION
# ===========================
HOST = "127.0.0.1"
PORT = 9390
USERNAME = "admin"
PASSWORD = "admin"

TARGET_HOST = "192.168.1.8"

DEFAULT_PORT_LIST   = "730ef368-57e2-11e1-a90f-406186ea4fc5"
DEFAULT_SCANNER_ID  = "08b69003-5fc2-4037-a479-93b440211c73"


# ---------------------------
# XML → Element
# ---------------------------
def to_xml(raw):
    return etree.fromstring(raw.encode() if isinstance(raw, str) else raw)


# ---------------------------
# Find report for task
# ---------------------------
def find_report_for_task(gmp, task_id):
    try:
        reports_raw = gmp.get_reports()
        reports = to_xml(reports_raw)

        # match by <task id="...">
        node = reports.xpath(f"//report[.//task/@id='{task_id}']/@id")
        if node:
            return node[0]

        # match by <task><id>...</id></task>
        node2 = reports.xpath(f"//report[.//task/id/text()='{task_id}']/@id")
        if node2:
            return node2[0]

        return None
    except:
        return None


# ---------------------------
# Download & Parse Report
# ---------------------------
def download_and_parse_report(gmp, report_id):
    # Select best format (XML preferred)
    formats_raw = gmp.get_report_formats()
    formats = to_xml(formats_raw)

    xml_fmt = formats.xpath("//report_format[contains(translate(@name, 'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ'),'XML')]/@id")

    if xml_fmt:
        fmt_id = xml_fmt[0]
    else:
        fmt_id = formats.xpath("//report_format/@id")[0]

    print(f"Using Report Format: {fmt_id}")

    report_raw = gmp.get_report(report_id=report_id, report_format_id=fmt_id)

    # Save raw XML
    xml_filename = f"openvas_report_{report_id}.xml"
    with open(xml_filename, "wb") as f:
        if isinstance(report_raw, str):
            f.write(report_raw.encode())
        else:
            f.write(report_raw)

    print("Saved XML report:", xml_filename)

    # Convert XML → JSON
    try:
        import xmltodict
        with open(xml_filename, "rb") as xr:
            parsed = xmltodict.parse(xr.read())

        json_filename = xml_filename + ".json"
        with open(json_filename, "w", encoding="utf-8") as jf:
            json.dump(parsed, jf, indent=2, ensure_ascii=False)

        print("JSON Parsed & Saved:", json_filename)
        return json_filename

    except Exception as e:
        print("JSON Parsing Failed:", e)
        return None


# ---------------------------
# MAIN WORKFLOW
# ---------------------------
def main():
    connection = TLSConnection(hostname=HOST, port=PORT)
    with Gmp(connection=connection) as gmp:

        print("Connecting to OpenVAS...")
        gmp.authenticate(USERNAME, PASSWORD)
        print("Authenticated successfully!")

        # 1️⃣ Create Target
        print("Creating Target...")
        target_raw = gmp.create_target(
            name="IntegratedTarget",
            hosts=[TARGET_HOST],
            port_list_id=DEFAULT_PORT_LIST
        )
        target_xml = to_xml(target_raw)
        target_id = target_xml.get("id")
        print("Target ID:", target_id)

        # 2️⃣ Fetch Scan Config
        print("Fetching scan configs...")
        configs = to_xml(gmp.get_scan_configs())
        config_id = configs.xpath("//config/@id")[0]
        print("Scan Config ID:", config_id)

        # 3️⃣ Create Task
        print("Creating Task...")
        task_raw = gmp.create_task(
            name="IntegratedTask",
            config_id=config_id,
            target_id=target_id,
            scanner_id=DEFAULT_SCANNER_ID
        )
        task_xml = to_xml(task_raw)
        task_id = task_xml.get("id")
        print("Task ID:", task_id)

        # 4️⃣ Start Scan
        print("Starting Scan...")
        gmp.start_task(task_id)
        print("Scan started!\nWaiting for report...")

        # 5️⃣ Poll for report
        report_id = None
        while True:
            report_id = find_report_for_task(gmp, task_id)
            if report_id:
                print("Report Available! ID:", report_id)
                break
            time.sleep(10)

        # 6️⃣ Download + JSON Parse
        json_file = download_and_parse_report(gmp, report_id)
        print("\n=== FINAL OUTPUT ===")
        print("Report JSON File:", json_file)


if __name__ == "__main__":
    main()
