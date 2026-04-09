import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import * as fp from 'fingerpose';
import { customGestures } from '../services/gestures';
import './VaultLogin.css';

const SEQUENCE = ['thumbs_up', 'thumbs_down', 'wave'];
const SEQUENCE_LABELS = ['Thumbs Up 👍', 'Thumbs Down 👎', 'Open Palm 👋'];
const REQUIRED_DURATION_MS = 1500;
const PAUSE_DURATION_MS = 1000;

const VaultLogin = () => {
  const videoRef = useRef(null);
  
  // UI States
  const [status, setStatus] = useState('loading'); // 'loading', 'scanning', 'paused', 'granting', 'unlocked'
  const [progress, setProgress] = useState(0); 
  const [currentStep, setCurrentStep] = useState(0);

  // Mutable refs for the recursive animation frame loop
  const statusRef = useRef('loading');
  const currentStepRef = useRef(0);
  const detectionStartTimeRef = useRef(null);
  const animationFrameId = useRef(null);

  // Sync state visually to refs
  const updateStatus = (newStatus) => {
    statusRef.current = newStatus;
    setStatus(newStatus);
  };

  const updateStep = (newStep) => {
    currentStepRef.current = newStep;
    setCurrentStep(newStep);
  };

  useEffect(() => {
    let model = null;
    let estimator = null;

    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          return new Promise((resolve) => {
            videoRef.current.onloadedmetadata = () => {
              resolve(videoRef.current);
            };
          });
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };

    const loadModel = async () => {
      try {
        await tf.ready();
        model = await handpose.load();
        estimator = new fp.GestureEstimator(customGestures);
        
        updateStatus('scanning');
        detectFrame(model, estimator);
      } catch (err) {
        console.error("Error loading model:", err);
        updateStatus('error');
      }
    };

    const init = async () => {
      await setupCamera();
      if (videoRef.current) {
        videoRef.current.play();
        await loadModel();
      }
    };

    init();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const detectFrame = async (model, estimator) => {
    if (!videoRef.current || videoRef.current.readyState !== 4) {
      animationFrameId.current = requestAnimationFrame(() => detectFrame(model, estimator));
      return;
    }

    const video = videoRef.current;
    
    // Stop scanning physically if we are paused, granting or unlocked
    if (statusRef.current === 'granting' || statusRef.current === 'unlocked' || statusRef.current === 'paused') {
      animationFrameId.current = requestAnimationFrame(() => detectFrame(model, estimator));
      return;
    }

    try {
      const targetGesture = SEQUENCE[currentStepRef.current];
      const hand = await model.estimateHands(video);

      if (hand.length > 0) {
        const est = estimator.estimate(hand[0].landmarks, 8.5); // min confidence 8.5
        
        if (est.gestures.length > 0) {
          // Find the gesture with the highest confidence
          const bestGesture = est.gestures.reduce((p, c) => (p.score > c.score ? p : c));

          if (bestGesture.name === targetGesture) {
            if (!detectionStartTimeRef.current) {
              detectionStartTimeRef.current = Date.now();
            } else {
              const elapsedTime = Date.now() - detectionStartTimeRef.current;
              const currentProgress = Math.min((elapsedTime / REQUIRED_DURATION_MS) * 100, 100);
              setProgress(currentProgress);

              if (elapsedTime >= REQUIRED_DURATION_MS) {
                // Sequence step successful!
                handleStepSuccess();
              }
            }
          } else {
            resetProgress();
          }
        } else {
           resetProgress();
        }
      } else {
        resetProgress();
      }
    } catch (err) {
      console.error("Detection error:", err);
    }

    // Continue loop
    animationFrameId.current = requestAnimationFrame(() => detectFrame(model, estimator));
  };

  const resetProgress = () => {
    detectionStartTimeRef.current = null;
    setProgress((prev) => (prev > 0 ? prev - 5 : 0));
  };

  const handleStepSuccess = () => {
    detectionStartTimeRef.current = null;
    setProgress(100);
    
    const nextStep = currentStepRef.current + 1;
    
    if (nextStep >= SEQUENCE.length) {
      // Entire sequence matched!
      handleAccessGranted();
    } else {
      updateStatus('paused');
      
      setTimeout(() => {
        updateStep(nextStep);
        setProgress(0);
        updateStatus('scanning');
      }, PAUSE_DURATION_MS);
    }
  };

  const handleAccessGranted = () => {
    updateStatus('granting');
    
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }

    setTimeout(() => {
      updateStatus('unlocked');
    }, 1500); 
  };

  return (
    <div className="vault-login-container">
      {status !== 'unlocked' ? (
        <div className={`login-interface ${status === 'granting' ? 'fade-out' : ''}`}>
          <div className="auth-header">
            <h2>Visual Security System</h2>
            <p>Perform the sequence to unlock.</p>
          </div>

          <div className="sequence-tracker">
            {SEQUENCE_LABELS.map((label, index) => (
              <div 
                key={index} 
                className={`sequence-step ${index < currentStep ? 'completed' : ''} ${index === currentStep && status !== 'paused' ? 'active' : ''}`}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="video-wrapper">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="webcam-feed"
            />
            {status === 'loading' && (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <span>Loading Hand Tracking Model...</span>
              </div>
            )}
            
            {status === 'scanning' && (
              <div className="scanning-overlay">
                <div className="scan-line"></div>
              </div>
            )}
            
            {status === 'paused' && (
              <div className="paused-overlay">
                <span>Sequence Registered! Get ready...</span>
              </div>
            )}

            {status === 'granting' && (
              <div className="success-overlay">
                <span>Access Granted</span>
              </div>
            )}
          </div>

          <div className="progress-container">
            <div className="progress-bar-bg">
              <div 
                className={`progress-bar-fill ${progress === 100 ? 'complete' : ''}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="status-text">
              {status === 'loading' ? 'Initializing...' : 
               status === 'paused' ? 'Pausing...' :
               status === 'granting' ? 'Unlocking Vault...' :
               progress > 0 ? `Verifying Gesture... ${Math.round(progress)}%` : `Waiting for: ${SEQUENCE_LABELS[currentStep]}`}
            </div>
          </div>
        </div>
      ) : (
        <div className="vault-content reveal-animation">
          <h2>Welcome to the Vault</h2>
          <div className="vault-dashboard">
            <div className="vault-card">
              <h3>Secure Data 1</h3>
              <p>Top secret information revealed here.</p>
            </div>
            <div className="vault-card">
              <h3>Secure Data 2</h3>
              <p>Highly confidential project details.</p>
            </div>
            <div className="vault-card">
              <h3>Control Center</h3>
              <p>Administrative access granted.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaultLogin;
