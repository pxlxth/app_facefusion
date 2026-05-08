import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

# RUTAS
FOTO = r"C:\Users\CSAENCUser\Desktop\Facefusion app\web\test.jpg"
VIDEO = r"C:\Users\CSAENCUser\Desktop\Facefusion app\web\static\videos\video_base.mp4"

# CHROMEDRIVER
service = Service(r"C:\chromedriver\chromedriver.exe")

# ABRIR CHROME
options = Options()
options.binary_location = r"C:\Users\CSAENCUser\Downloads\chrome-win64\chrome-win64\chrome.exe"
driver = webdriver.Chrome(
    service=service,
    options=options
)
# ABRIR FACEFUSION
driver.get("http://127.0.0.1:7860")

print("Esperando carga...")
time.sleep(8)

# INPUTS FILE
inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='file']")

print("Inputs encontrados:", len(inputs))

# SUBIR FOTO
inputs[0].send_keys(FOTO)
print("Foto subida")
time.sleep(3)

# SUBIR VIDEO
inputs[1].send_keys(VIDEO)
print("Video subido")
time.sleep(3)

# BUSCAR BOTÓN START
botones = driver.find_elements(By.TAG_NAME, "button")

for boton in botones:
    texto = boton.text.lower()

    if "start" in texto:
        print("Botón encontrado")
        boton.click()
        break

print("Procesando...")
time.sleep(120)

print("Terminado")