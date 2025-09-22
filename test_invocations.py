import requests

url = "http://104.214.168.212:80/invocations"
headers = {"Content-Type": "application/json"}
data = {
    "inputs": [
        [0, 6, 74.66, 73.28, 84.48, 70.67, 83, 75.75, 55.23, 70.74, 81.46, 81.88, 55.25, 74.69]
    ]
}

try:
    resp = requests.post(url, headers=headers, json=data, timeout=30)
    print("Status code:", resp.status_code)
    print("Response:", resp.text)
except Exception as e:
    print("Error:", e)