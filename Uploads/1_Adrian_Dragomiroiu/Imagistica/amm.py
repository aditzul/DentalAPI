import pyautogui
import time

def move_mouse():
    print("Mouse mover started.")
    try:
        while True:
            # Move the mouse to a new position
            pyautogui.moveRel(20, 20)  # Adjust the values as needed
           
            # Move the mouse back
            pyautogui.moveRel(-20, -20)  # Adjust the values as needed
            
            # Perform left click
            pyautogui.click()
            
            # Wait for a certain interval (in seconds)
            time.sleep(30)  # Adjust the interval as needed
    except KeyboardInterrupt:
        print("Mouse mover stopped.")

if __name__ == "__main__":
    move_mouse()
