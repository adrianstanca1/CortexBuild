#!/usr/bin/env python3
import os
import time
import subprocess
import sys

def clear_screen():
    os.system('clear' if os.name == 'posix' else 'cls')

def print_header():
    print("🚀" + "="*60 + "🚀")
    print("     ASAgents Final - Terminal Interface")
    print("🚀" + "="*60 + "🚀")
    print()

def print_status():
    print("📊 SERVER STATUS:")
    print("-" * 20)
    
    # Check Node.js server
    try:
        result = subprocess.run(['curl', '-s', '-m', '3', 'http://localhost:3000/test'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("🟢 Node.js Server (port 3000): RUNNING")
        else:
            print("🔴 Node.js Server (port 3000): NOT RESPONDING")
    except:
        print("🔴 Node.js Server (port 3000): ERROR")
    
    # Check Python server
    try:
        result = subprocess.run(['curl', '-s', '-m', '3', 'http://localhost:8000/test'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("🟢 Python Server (port 8000): RUNNING")
        else:
            print("🔴 Python Server (port 8000): NOT RESPONDING")
    except:
        print("🔴 Python Server (port 8000): ERROR")
    
    print()

def show_menu():
    print("🎯 AVAILABLE OPTIONS:")
    print("-" * 20)
    print("1. 🌐 Open Node.js Server (Fancy Interface)")
    print("2. 🐍 Open Python Server (Simple Interface)")
    print("3. 📁 Open Direct HTML File")
    print("4. 🔍 Run Network Diagnostic")
    print("5. 📊 Show Server Status")
    print("6. 🔄 Refresh Screen")
    print("7. ❌ Exit")
    print()

def open_browser(url):
    try:
        if sys.platform == 'darwin':  # macOS
            subprocess.run(['open', url])
        elif sys.platform == 'linux':  # Linux
            subprocess.run(['xdg-open', url])
        elif sys.platform == 'win32':  # Windows
            subprocess.run(['start', url], shell=True)
        print(f"✅ Attempted to open: {url}")
    except Exception as e:
        print(f"❌ Failed to open browser: {e}")

def run_diagnostic():
    print("🔍 Running Network Diagnostic...")
    print("-" * 30)
    try:
        subprocess.run(['./diagnostic.sh'], cwd='/Users/admin/final')
    except:
        print("❌ Could not run diagnostic script")

def main():
    while True:
        clear_screen()
        print_header()
        print(f"⏰ Current Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        print_status()
        show_menu()
        
        try:
            choice = input("👉 Select an option (1-7): ").strip()
            
            if choice == '1':
                print("🚀 Opening Node.js Server...")
                open_browser('http://localhost:3000/')
                input("\nPress Enter to continue...")
                
            elif choice == '2':
                print("🐍 Opening Python Server...")
                open_browser('http://localhost:8000/')
                input("\nPress Enter to continue...")
                
            elif choice == '3':
                print("📁 Opening Direct HTML File...")
                open_browser('file:///Users/admin/final/direct-test.html')
                input("\nPress Enter to continue...")
                
            elif choice == '4':
                run_diagnostic()
                input("\nPress Enter to continue...")
                
            elif choice == '5':
                print("Refreshing status...")
                time.sleep(1)
                
            elif choice == '6':
                print("Refreshing screen...")
                time.sleep(0.5)
                
            elif choice == '7':
                print("\n👋 Goodbye!")
                break
                
            else:
                print("❌ Invalid option. Please choose 1-7.")
                input("Press Enter to continue...")
                
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
            input("Press Enter to continue...")

if __name__ == "__main__":
    main()