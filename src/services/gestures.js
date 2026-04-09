import * as fp from 'fingerpose';

// 1. Define Thumbs Down Gesture
const thumbsDownGesture = new fp.GestureDescription('thumbs_down');

// Thumb should be pointing down
thumbsDownGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
thumbsDownGesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.VerticalDown, 1.0);
thumbsDownGesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.DiagonalDownLeft, 0.9);
thumbsDownGesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.DiagonalDownRight, 0.9);

// All other fingers must be curled
for (let finger of [fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
    thumbsDownGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
    thumbsDownGesture.addCurl(finger, fp.FingerCurl.HalfCurl, 0.9);
}

// 2. Define Wave / Open Palm Gesture
const waveGesture = new fp.GestureDescription('wave');

// All fingers should be fully extended (NoCurl)
for (let finger of [fp.Finger.Thumb, fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
    waveGesture.addCurl(finger, fp.FingerCurl.NoCurl, 1.0);
}

// Optionally, we can define that the fingers point up or diagonally up for a natural open palm
for (let finger of [fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
    waveGesture.addDirection(finger, fp.FingerDirection.VerticalUp, 1.0);
    waveGesture.addDirection(finger, fp.FingerDirection.DiagonalUpLeft, 0.9);
    waveGesture.addDirection(finger, fp.FingerDirection.DiagonalUpRight, 0.9);
}

// Export custom gestures alongside the built-in Thumbs Up
export const customGestures = [
    fp.Gestures.ThumbsUpGesture,
    thumbsDownGesture, 
    waveGesture
];
