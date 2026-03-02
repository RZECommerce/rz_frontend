
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { employeeService } from "@/services/employee.service";
import {
    ErrorOutline as AlertCircleIcon,
    CameraAlt as Camera01Icon,
    Cancel as Cancel01Icon,
    CheckCircle as CheckmarkCircle01Icon,
} from "@mui/icons-material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface FaceRegistrationProps {
  employeeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasFaceEncoding?: boolean;
}

export function FaceRegistration({
  employeeId,
  open,
  onOpenChange,
  hasFaceEncoding = false,
}: FaceRegistrationProps) {
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [facePosition, setFacePosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [faceDetector, setFaceDetector] = useState<any>(null);

  const registerFace = useMutation({
    mutationFn: (imageData: string) => employeeService.registerFace(employeeId, imageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
      toast.success("Face registered successfully");
      stopCamera();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to register face", {
        description: error.message || "Please ensure your face is clearly visible and try again.",
      });
    },
  });

  // Initialize Face Detector API if available
  useEffect(() => {
    if (typeof window !== "undefined" && "FaceDetector" in window) {
      // @ts-ignore - FaceDetector API is experimental
      const detector = new FaceDetector({
        fastMode: true,
        maxDetections: 1,
      });
      setFaceDetector(detector);
    }
  }, []);

  const drawGuideOverlay = useCallback(() => {
    if (!overlayCanvasRef.current || !videoRef.current) return;

    const overlay = overlayCanvasRef.current;
    const video = videoRef.current;
    const ctx = overlay.getContext("2d");

    if (!ctx) return;

    overlay.width = video.videoWidth;
    overlay.height = video.videoHeight;

    ctx.clearRect(0, 0, overlay.width, overlay.height);

    // Draw guide frame
    const centerX = overlay.width / 2;
    const centerY = overlay.height / 2;
    const targetSize = Math.min(overlay.width, overlay.height) * 0.4;

    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--muted-foreground").trim() || "#6b7280";
    ctx.lineWidth = 2;
    ctx.setLineDash([15, 10]);
    ctx.strokeRect(
      centerX - targetSize / 2,
      centerY - targetSize / 2,
      targetSize,
      targetSize
    );

    // Draw corner guides
    const cornerSize = 20;
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--muted-foreground").trim() || "#6b7280";
    ctx.lineWidth = 3;
    ctx.setLineDash([]);

    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(centerX - targetSize / 2, centerY - targetSize / 2 + cornerSize);
    ctx.lineTo(centerX - targetSize / 2, centerY - targetSize / 2);
    ctx.lineTo(centerX - targetSize / 2 + cornerSize, centerY - targetSize / 2);
    ctx.stroke();

    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(centerX + targetSize / 2 - cornerSize, centerY - targetSize / 2);
    ctx.lineTo(centerX + targetSize / 2, centerY - targetSize / 2);
    ctx.lineTo(centerX + targetSize / 2, centerY - targetSize / 2 + cornerSize);
    ctx.stroke();

    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(centerX - targetSize / 2, centerY + targetSize / 2 - cornerSize);
    ctx.lineTo(centerX - targetSize / 2, centerY + targetSize / 2);
    ctx.lineTo(centerX - targetSize / 2 + cornerSize, centerY + targetSize / 2);
    ctx.stroke();

    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(centerX + targetSize / 2 - cornerSize, centerY + targetSize / 2);
    ctx.lineTo(centerX + targetSize / 2, centerY + targetSize / 2);
    ctx.lineTo(centerX + targetSize / 2, centerY + targetSize / 2 - cornerSize);
    ctx.stroke();
  }, []);

  const drawFaceBox = useCallback((
    ctx: CanvasRenderingContext2D,
    boundingBox: DOMRectReadOnly,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const { x, y, width, height } = boundingBox;

    // Draw guide frame (target area)
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const targetSize = Math.min(canvasWidth, canvasHeight) * 0.4;

    // Check if face is in good position
    const faceCenterX = x + width / 2;
    const faceCenterY = y + height / 2;
    const distanceFromCenter = Math.sqrt(
      Math.pow(faceCenterX - centerX, 2) + Math.pow(faceCenterY - centerY, 2)
    );
    const isWellPositioned = distanceFromCenter < targetSize * 0.3 && 
                             width > targetSize * 0.6 && 
                             width < targetSize * 1.4;

    // Draw target guide frame
    const successColor = getComputedStyle(document.documentElement).getPropertyValue("--green").trim() || "#10b981";
    const warningColor = getComputedStyle(document.documentElement).getPropertyValue("--amber").trim() || "#fbbf24";
    const errorColor = getComputedStyle(document.documentElement).getPropertyValue("--red").trim() || "#ef4444";
    
    ctx.strokeStyle = isWellPositioned ? successColor : warningColor;
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(
      centerX - targetSize / 2,
      centerY - targetSize / 2,
      targetSize,
      targetSize
    );

    // Draw face detection box
    ctx.strokeStyle = isWellPositioned ? successColor : errorColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeRect(x, y, width, height);

    // Draw center point
    ctx.fillStyle = isWellPositioned ? successColor : errorColor;
    ctx.beginPath();
    ctx.arc(faceCenterX, faceCenterY, 4, 0, 2 * Math.PI);
    ctx.fill();
  }, []);

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [open]);

  // Face detection loop
  const detectFace = useCallback(async () => {
    if (!videoRef.current || !overlayCanvasRef.current || !isReady) {
      if (isReady && videoRef.current) {
        // Fallback: just show guide overlay
        drawGuideOverlay();
        setFaceDetected(false);
      }
      return;
    }

    // If FaceDetector is not available, just show guide overlay
    // Don't set faceDetected to true - let user capture manually
    if (!faceDetector) {
      drawGuideOverlay();
      setFaceDetected(false);
      animationFrameRef.current = requestAnimationFrame(detectFace);
      return;
    }

    try {
      const video = videoRef.current;
      const overlay = overlayCanvasRef.current;
      const ctx = overlay.getContext("2d");

      if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationFrameRef.current = requestAnimationFrame(detectFace);
        return;
      }

      // Set overlay canvas size to match video
      overlay.width = video.videoWidth;
      overlay.height = video.videoHeight;

      // Detect faces
      const faces = await faceDetector.detect(video);

      // Clear overlay
      ctx.clearRect(0, 0, overlay.width, overlay.height);

      if (faces.length > 0) {
        const face = faces[0];
        const boundingBox = face.boundingBox;

        // Calculate position relative to video element
        const videoRect = video.getBoundingClientRect();
        const scaleX = videoRect.width / video.videoWidth;
        const scaleY = videoRect.height / video.videoHeight;

        const x = boundingBox.x * scaleX;
        const y = boundingBox.y * scaleY;
        const width = boundingBox.width * scaleX;
        const height = boundingBox.height * scaleY;

        setFacePosition({ x, y, width, height });
        setFaceDetected(true);

        // Draw face detection box on overlay
        drawFaceBox(ctx, boundingBox, overlay.width, overlay.height);
      } else {
        setFaceDetected(false);
        setFacePosition(null);
        drawGuideOverlay();
      }
    } catch (err) {
      console.error("Face detection error:", err);
      drawGuideOverlay();
    }

    animationFrameRef.current = requestAnimationFrame(detectFace);
  }, [isReady, faceDetector, drawGuideOverlay, drawFaceBox]);

  // Start face detection when camera is ready
  useEffect(() => {
    if (isReady && open) {
      detectFace();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isReady, open, detectFace]);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        videoRef.current.onloadedmetadata = () => {
          setIsReady(true);
          // Draw initial guide overlay
          if (overlayCanvasRef.current) {
            drawGuideOverlay();
          }
        };
      }
    } catch (err: unknown) {
      console.error("Camera error:", err);
      const error = err as Error & { name?: string };
      setError(
        error.name === "NotAllowedError"
          ? "Camera access denied. Please allow camera access and try again."
          : error.name === "NotFoundError"
            ? "No camera found. Please connect a camera and try again."
            : "Failed to access camera. Please try again."
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsReady(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !isReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    stopCamera();
    registerFace.mutate(imageData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Register Face for Time Clock</DialogTitle>
          <DialogDescription>
            Capture a clear photo of the employee's face for facial recognition time clock access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {hasFaceEncoding && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <CheckmarkCircle01Icon className="size-5 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-800 dark:text-green-200">
                Face encoding is already registered. Registering again will replace the existing encoding.
              </p>
            </div>
          )}

          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            {error ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white p-4">
                <div className="text-center space-y-3">
                  <p className="text-red-400">{error}</p>
                  <Button onClick={startCamera} variant="outline" size="sm">
                    Retry
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas
                  ref={overlayCanvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ imageRendering: "pixelated" }}
                />
                {!isReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white z-10">
                    <p>Initializing camera...</p>
                  </div>
                )}
                {isReady && (
                  <div className="absolute top-4 left-4 right-4 z-10">
                    {faceDetector ? (
                      faceDetected ? (
                        <div 
                          className="flex items-center gap-2 p-2 text-white rounded-lg text-sm"
                          style={{ backgroundColor: "color-mix(in srgb, var(--green) 90%, transparent)" }}
                        >
                          <CheckmarkCircle01Icon className="size-5" />
                          <span>Face detected! Position your face in the center frame.</span>
                        </div>
                      ) : (
                        <div 
                          className="flex items-center gap-2 p-2 text-white rounded-lg text-sm"
                          style={{ backgroundColor: "color-mix(in srgb, var(--amber) 90%, transparent)" }}
                        >
                          <AlertCircleIcon className="size-5" />
                          <span>Position your face in the center of the frame</span>
                        </div>
                      )
                    ) : (
                      <div 
                        className="flex items-center gap-2 p-2 text-white rounded-lg text-sm"
                        style={{ backgroundColor: "color-mix(in srgb, var(--blue) 90%, transparent)" }}
                      >
                        <AlertCircleIcon className="size-5" />
                        <span>Position your face in the center frame and click capture</span>
                      </div>
                    )}
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={capturePhoto}
              disabled={!isReady || registerFace.isPending || !!error || (faceDetector && !faceDetected)}
              size="lg"
              className="flex-1"
            >
              <Camera01Icon className="mr-2 size-5" />
              {registerFace.isPending ? "Registering..." : "Capture & Register"}
            </Button>
            <Button
              onClick={() => {
                stopCamera();
                onOpenChange(false);
              }}
              variant="outline"
              size="lg"
              disabled={registerFace.isPending}
            >
              <Cancel01Icon className="mr-2 size-5" />
              Cancel
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-center text-muted-foreground">
              {faceDetector
                ? faceDetected
                  ? "Face detected! Ensure your face is centered in the frame, then click 'Capture & Register'"
                  : "Position the employee's face in the center of the frame with good lighting"
                : "Position the employee's face in the center of the frame with good lighting, then click 'Capture & Register'"}
            </p>
            {faceDetector && !faceDetected && isReady && (
              <div className="flex items-center justify-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                <AlertCircleIcon className="size-5" />
                <span>Waiting for face detection...</span>
              </div>
            )}
            {!faceDetector && isReady && (
              <div className="flex items-center justify-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                <AlertCircleIcon className="size-5" />
                <span>Face detection not available in this browser. You can still capture manually.</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

