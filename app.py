import os
import uuid
import subprocess
from flask import Flask, request, jsonify, send_from_directory, send_file
from flask import render_template

app = Flask(__name__)

BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR  = os.path.join(BASE_DIR, "uploads")
OUTPUT_DIR  = os.path.join(BASE_DIR, "outputs")
VIDEO_BASE = os.path.join(BASE_DIR, "static", "videos", "video_base.mp4")
FACEFUSION  = os.path.join(BASE_DIR, "..", "facefusion", "facefusion.py")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/procesar", methods=["POST"])
def procesar():

    if "foto" not in request.files:
        return jsonify({"success": False, "error": "No se recibió ninguna foto"}), 400

    foto = request.files["foto"]

    if foto.filename == "":
        return jsonify({"success": False, "error": "Archivo vacío"}), 400

    extension = os.path.splitext(foto.filename)[1].lower()

    if extension not in [".jpg", ".jpeg", ".png"]:
        return jsonify({"success": False, "error": "Solo se permiten imágenes JPG o PNG"}), 400


    # LIMPIAR OUTPUTS VIEJOS
    for file in os.listdir(OUTPUT_DIR):

        file_path = os.path.join(OUTPUT_DIR, file)

        if os.path.isfile(file_path):
            os.remove(file_path)
            # LIMPIAR UPLOADS
    for file in os.listdir(UPLOAD_DIR):

        file_path = os.path.join(UPLOAD_DIR, file)

        if os.path.isfile(file_path):
            os.remove(file_path)


    nombre_id   = str(uuid.uuid4())
    foto_path   = os.path.join(UPLOAD_DIR, f"{nombre_id}{extension}")
    output_path = os.path.join(OUTPUT_DIR, f"{nombre_id}.mp4")

    foto.save(foto_path)

    comando = [
        "python", FACEFUSION,
        "headless-run",
        "--source-paths", foto_path,
        "--target-path", VIDEO_BASE,
        "--output-path", output_path,
        "--processors", "face_swapper",
        "--face-swapper-model", "inswapper_128",
        "--face-swapper-pixel-boost", "128x128",
        "--face-swapper-weight", "0.5",
        "--execution-providers", "directml",
        "--temp-frame-format", "png",
        "--output-audio-encoder", "flac",
        "--output-audio-quality", "70",
        "--output-video-encoder", "rawvideo",
        "--output-video-preset", "ultrafast",
        "--output-video-quality", "80",
        "--output-video-scale", "1",
        "--output-video-fps", "24",
        "--log-level", "info"
    ]
    
    try:
        resultado = subprocess.run(
            comando,
            capture_output=True,
            text=True,
            timeout=1800,  
            cwd=os.path.join(BASE_DIR, "..", "facefusion") 

        )

        if resultado.returncode == 0 and os.path.exists(output_path):
            return jsonify({"success": True, "video_id": nombre_id})
        else:
            print("STDERR:", resultado.stderr)
            return jsonify({"success": False, "error": "FaceFusion falló", "detalle": resultado.stderr}), 500

    except subprocess.TimeoutExpired:
        return jsonify({"success": False, "error": "Tiempo de procesamiento excedido"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/resultado/<video_id>")
def resultado(video_id):
    output_path = os.path.join(OUTPUT_DIR, f"{video_id}.mp4")
    if os.path.exists(output_path):
        return send_file(output_path, mimetype="video/mp4")
    return jsonify({"error": "Video no encontrado"}), 404

if __name__ == "__main__":
    app.run( port=5000)