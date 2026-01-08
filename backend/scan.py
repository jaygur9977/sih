from gvm.connections import TLSConnection
from gvm.protocols.gmp import Gmp
from lxml import etree
import time
import os

HOST = "127.0.0.1"
PORT = 9390
USERNAME = "admin"
PASSWORD = "admin"

DEFAULT_PORT_LIST = "730ef368-57e2-11e1-a90f-406186ea4fc5"
DEFAULT_SCANNER_ID = "08b69003-5fc2-4037-a479-93b440211c73"

# ================================
# Helper Functions
# ================================
def to_xml(raw):
    return etree.fromstring(raw.encode() if isinstance(raw, str) else raw)

def get_txt_format_id(gmp):
    """Find the TXT format id automatically"""
    fmts = gmp.get_report_formats()
    root = to_xml(fmts)

    node = root.xpath("//report_format[contains(translate(@name,'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ'),'TXT')]/@id")
    if node:
        return node[0]

    raise RuntimeError("TXT Report Format not found on server!")

def wait_for_completion(gmp, task_id):
    """Poll task status until completed"""
    print("Waiting for task to complete...")

    while True:
        status_xml = gmp.get_tasks(task_id=task_id)
        root = to_xml(status_xml)

        status = root.xpath("//task/status/text()")
        if status:
            status = status[0]
            print("Current Status:", status)

            if status.lower() in ["done", "finished", "complete"]:
                print("Scan completed!")
                return

        time.sleep(8)

def download_report(gmp, task_id):
    """Fetch and download final TXT report"""
    reports_xml = gmp.get_reports()
    root = to_xml(reports_xml)

    report_id = root.xpath(f"//report[.//task/@id='{task_id}']/@id")
    if not report_id:
        report_id = root.xpath("//report/@id")

    if not report_id:
        raise RuntimeError("No report found!")

    report_id = report_id[0]
    txt_id = get_txt_format_id(gmp)

    print("Downloading TXT report...")
    data = gmp.get_report(report_id=report_id, report_format_id=txt_id)

    fname = f"scan_report_{task_id}.txt"
    with open(fname, "wb") as f:
        f.write(data if isinstance(data, bytes) else data.encode())

    print("Saved TXT Report as:", fname)

# ================================
# MAIN AUTOMATION
# ================================
def scan_and_fetch(targets):
    """
    targets = [10.11.83.96]
    """

    connection = TLSConnection(hostname=HOST, port=PORT)
    with Gmp(connection=connection) as gmp:

        print("Connecting...")
        gmp.authenticate(USERNAME, PASSWORD)
        print("Authenticated!")

        # -----------------------------------
        # 1. CREATE ONE MULTI-HOST TARGET
        # -----------------------------------
        hosts_combined = ",".join(targets)

        print("Creating target for:", hosts_combined)

        created = gmp.create_target(
            name="AutoMultiTarget",
            hosts=[hosts_combined],
            port_list_id=DEFAULT_PORT_LIST
        )

        t_xml = to_xml(created)
        target_id = t_xml.get("id")
        print("Target ID:", target_id)

        # -----------------------------------
        # 2. PICK FIRST SCAN CONFIG
        # -----------------------------------
        configs = to_xml(gmp.get_scan_configs())
        scan_config = configs.xpath("//config/@id")[0]
        print("Scan Config:", scan_config)

        # -----------------------------------
        # 3. CREATE TASK
        # -----------------------------------
        task_xml = gmp.create_task(
            name="AutoMultiScanTask",
            config_id=scan_config,
            target_id=target_id,
            scanner_id=DEFAULT_SCANNER_ID
        )

        t_xml = to_xml(task_xml)
        task_id = t_xml.get("id")
        print("Task ID:", task_id)

        # -----------------------------------
        # 4. START SCAN
        # -----------------------------------
        print("\nStarting scan...")
        gmp.start_task(task_id)
        print("Scan started.")

        # -----------------------------------
        # 5. WAIT UNTIL COMPLETION
        # -----------------------------------
        wait_for_completion(gmp, task_id)

        # -----------------------------------
        # 6. DOWNLOAD REPORT (TXT)
        # -----------------------------------
        download_report(gmp, task_id)


# ================================
# RUN
# ================================
if __name__ == "__main__":
    # Add ANY number of IPs here:
    targets = [
        "192.168.1.8",
        "192.168.1.10",
        "192.168.1.12",
        "192.168.1.15",
    ]

    scan_and_fetch(targets)
