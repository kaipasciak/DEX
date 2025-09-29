# Script for starting blockchain, deploying contracts and launching frontend
# Author: Kai Pasciak

import subprocess
import sys
import json
import os 
import time

# Commands
GANACHE_CMD = ["ganache-cli", "--mnemonic", "test test test test test test test test test test test junk"]
DEPLOY_CMD = ["node", "./scripts/deploy.js"]
FRONTEND_DIR = "frontend"
ADDRESSES_FILE = os.path.join(FRONTEND_DIR, "src", "artifacts", "addresses.json")

def main():
    # 1. Start Ganache
    print("Starting Ganache...")
    ganache = subprocess.Popen(GANACHE_CMD, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(3) # Wait for Ganache to boot
    
    try:
        # 2. Run deploy script (writes addresses.json automatically)
        print("running deploy script...")
        subprocess.run(DEPLOY_CMD, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        # Print addresses
        if os.path.exists(ADDRESSES_FILE):
            with open(ADDRESSES_FILE, "r") as f:
                addresses = json.load(f)
            print("\n=== Deployed Addresses ===")
            for key, val in addresses.items():
                print(f"{key}: {val}")
            print("============================")
        else:
            print(f"Error: {ADDRESSES_FILE} not found!")

        # Print private keys
        print("(0) 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80")
        print("(1) 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d")
        print("(2) 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a")

        # 3. Start React app
        print("Starting React app...")
        with open("react.log", "w") as log:
            frontend = subprocess.Popen(["npm", "start"], cwd=FRONTEND_DIR, stdout=log, stderr=log)

        print("Press Ctrl+C to exit and kill subprocesses.")
        ganache.wait()
        

    except KeyboardInterrupt:
        print("Shutting down...")
    finally:
        ganache.terminate()
        frontend.terminate()
        sys.exit(0)

if __name__ == "__main__":
    main()