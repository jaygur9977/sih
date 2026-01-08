# save as fetch_partial_report.py
from gvm.connections import TLSConnection
from gvm.protocols.gmp import Gmp
from lxml import etree
import time
import sys

HOST="127.0.0.1"
PORT=9390
USERNAME="admin"
PASSWORD="admin"

def to_xml(raw):
    return etree.fromstring(raw.encode() if isinstance(raw, str) else raw)

def find_report_for_task(gmp, task_id=None, explicit_report_id=None):
    """
    Try multiple ways to find an available report:
    1) If explicit_report_id provided, try get_reports(report_id=...)
    2) List all reports and find one referencing the task_id
    3) Fallback: return latest report id from get_reports()
    Returns report_id or None.
    """
    try:
        if explicit_report_id:
            # try to get metadata for this report
            try:
                r = gmp.get_reports(report_id=explicit_report_id)
                root = to_xml(r)
                if root.xpath(f"//report[@id='{explicit_report_id}']") or root.xpath(f"//report/id[text()='{explicit_report_id}']"):
                    return explicit_report_id
            except Exception:
                pass

        # list all reports and try to match task reference
        r_all = gmp.get_reports()
        root_all = to_xml(r_all)

        if task_id:
            # many GMPs represent the task reference as: <report><task id="..."/></report>
            node = root_all.xpath(f"//report[.//task/@id='{task_id}']/@id")
            if node:
                return node[0]
            # alternate structure: <report><task><id>...</id></task></report>
            node2 = root_all.xpath(f"//report[.//task/id/text()='{task_id}']/@id")
            if node2:
                return node2[0]

        # fallback: return latest report id (first report element)
        latest = root_all.xpath("//report/@id")
        if latest:
            return latest[0]
    except Exception as e:
        print("Warning: could not list/find reports:", e)
    return None

def download_report_by_id(gmp, report_id, preferred_format_names=("XML","JSON","TXT","PDF")):
    # list formats
    fmts = gmp.get_report_formats()
    froot = to_xml(fmts)
    # try pick preferred
    chosen = None
    for pref in preferred_format_names:
        node = froot.xpath(f"//report_format[contains(translate(@name,'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ'),'{pref.upper()}')]/@id")
        if node:
            chosen = node[0]
            break
    if not chosen:
        # fallback first available
        node = froot.xpath("//report_format/@id")
        if node:
            chosen = node[0]
        else:
            raise RuntimeError("No report formats available from the server.")

    print("Using report format id:", chosen)
    data = gmp.get_report(report_id=report_id, report_format_id=chosen)
    # write to disk
    ext = "dat"
    # guess extension from format name if available
    fmt_name_nodes = froot.xpath(f"//report_format[@id='{chosen}']/@name")
    if fmt_name_nodes:
        name = fmt_name_nodes[0]
        if "xml" in name.lower():
            ext = "xml"
        elif "html" in name.lower():
            ext = "html"
        elif "pdf" in name.lower():
            ext = "pdf"
        elif "txt" in name.lower():
            ext = "txt"
    fname = f"openvas_report_{report_id}.{ext}"
    with open(fname, "wb") as fh:
        if isinstance(data, str):
            fh.write(data.encode())
        else:
            fh.write(data)
    print("Saved report to:", fname)
    return fname

# -------------------------
# MAIN
# -------------------------
def main(task_id=None, explicit_report_id=None, wait_for_complete=True, poll_interval=10, max_wait=3600):
    """
    task_id: if known, pass task id (recommended)
    explicit_report_id: if start_task gave you report id, pass it
    wait_for_complete: if True -> poll until report appears or timeout; if False -> attempt immediate fetch
    """
    connection = TLSConnection(hostname=HOST, port=PORT)
    with Gmp(connection=connection) as gmp:
        gmp.authenticate(USERNAME, PASSWORD)
        print("Connected & authenticated.")

        report_id = None
        start = time.time()

        try:
            if not wait_for_complete:
                # immediate attempt to fetch whatever exists now
                report_id = find_report_for_task(gmp, task_id=task_id, explicit_report_id=explicit_report_id)
                if not report_id:
                    print("No report currently available.")
                    return
            else:
                print("Waiting for report (press Ctrl+C to fetch partial/available report)...")
                while True:
                    # try to find a report referencing task (or explicit id)
                    report_id = find_report_for_task(gmp, task_id=task_id, explicit_report_id=explicit_report_id)
                    if report_id:
                        print("Found available report id:", report_id)
                        break
                    if time.time() - start > max_wait:
                        print("Max wait reached. Attempting to fetch whatever is available now.")
                        report_id = find_report_for_task(gmp, task_id=task_id, explicit_report_id=explicit_report_id)
                        break
                    time.sleep(poll_interval)
        except KeyboardInterrupt:
            print("\nInterrupted by user — attempting to fetch any available report immediately...")
            report_id = find_report_for_task(gmp, task_id=task_id, explicit_report_id=explicit_report_id)

        if not report_id:
            print("No report could be located. Exiting.")
            return

        try:
            fname = download_report_by_id(gmp, report_id)
            # optional: convert XML->JSON if xmltodict installed and file is xml
            if fname.endswith(".xml"):
                try:
                    import xmltodict, json
                    with open(fname, "rb") as xf:
                        parsed = xmltodict.parse(xf.read())
                    jname = fname + ".json"
                    with open(jname, "w", encoding="utf-8") as jf:
                        json.dump(parsed, jf, indent=2, ensure_ascii=False)
                    print("Also converted XML ->", jname)
                except Exception:
                    pass
        except Exception as e:
            print("Failed to download report:", e)

if __name__ == "__main__":
    # replace below with your known task_id or report_id if you have one
    # example: task_id = "ae354d64-3461-4e65-bbc7-644b6ebaef02"
    TASK_ID = "a3b52c5c-7887-45b3-a2c6-02723f153712"   # change to your task id
    EXPLICIT_REPORT_ID = "8538de98-dfd7-43a0-9d81-27bd5044579c"  # or None

    # If you want: set wait_for_complete=False to fetch whatever exists immediately
    main(task_id=TASK_ID, explicit_report_id=EXPLICIT_REPORT_ID, wait_for_complete=True, poll_interval=8, max_wait=3600)