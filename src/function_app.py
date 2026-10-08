"""Azure Functions v2 Python ASGI wrapper for Azure Cloud Topology Engine."""

try:
    import azure.functions as func
    from src.main import app

    # Wrap FastAPI app inside Azure Functions ASGI wrapper
    function_app = func.AsgiFunctionApp(app=app, http_auth_level=func.AuthLevel.ANONYMOUS)
except ImportError:
    # Running outside Azure Functions host (e.g. standalone uvicorn container or pytest)
    function_app = None
