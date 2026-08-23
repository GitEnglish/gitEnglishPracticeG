import subprocess
import time

def start_dev_server():
    process = subprocess.Popen(["pnpm", "run", "dev"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    # Wait for the server to be ready
    for i in range(20):
        time.sleep(1)
        if process.poll() is not None:
            print("Server exited early")
            break
        print(f"Waiting for server... {i}s")

start_dev_server()
