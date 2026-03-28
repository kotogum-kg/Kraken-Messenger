import * as LocalAuthentication from 'expo-local-authentication';

export const authenticateWithFingerprint = async () => {
  try {
    // Check if hardware supports fingerprint authentication
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      throw new Error('Fingerprint authentication is not supported on this device.');
    }

    // Check if any fingerprint is enrolled
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      throw new Error('No fingerprints are enrolled.');
    }

    // Authenticate the user with fingerprint
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate with your fingerprint',
      fallbackLabel: 'Use PIN',
      cancelLabel: 'Cancel',
    });

    // Check if authentication was successful
    if (result.success) {
      return true; // Authentication successful
    } else {
      throw new Error('Authentication failed.');
    }
  } catch (error) {
    console.error(error);
    // Handle errors, fallback to PIN authentication or another method
    return false; // Fallback can be implemented here
  }
};