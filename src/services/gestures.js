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

// 3. Define Fist Gesture
const fistGesture = new fp.GestureDescription('fist');
for (let finger of [fp.Finger.Thumb, fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
    fistGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
    fistGesture.addCurl(finger, fp.FingerCurl.HalfCurl, 0.9);
}

// 4. Define Point Up Gesture
const pointUpGesture = new fp.GestureDescription('point_up');
pointUpGesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
pointUpGesture.addDirection(fp.Finger.Index, fp.FingerDirection.VerticalUp, 1.0);
pointUpGesture.addDirection(fp.Finger.Index, fp.FingerDirection.DiagonalUpRight, 0.9);
pointUpGesture.addDirection(fp.Finger.Index, fp.FingerDirection.DiagonalUpLeft, 0.9);
for (let finger of [fp.Finger.Thumb, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
    pointUpGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
    pointUpGesture.addCurl(finger, fp.FingerCurl.HalfCurl, 0.9);
}

// Export custom gestures alongside the built-in ones
export const customGestures = [
    fp.Gestures.ThumbsUpGesture,
    fp.Gestures.VictoryGesture,
    thumbsDownGesture, 
    waveGesture,
    fistGesture,
    pointUpGesture
];
