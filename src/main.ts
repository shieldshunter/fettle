import { initWaves } from './wave';  // Adjust path if needed
import './login-dialog'; // Adjust path if needed

window.addEventListener('DOMContentLoaded', () => {
  // Start the wave/animation
  initWaves();

  // Grab the simplified <login-dialog> element
  const loginDialog = document.getElementById('login');
  // Simply show it — no auth checks, etc.
  if (loginDialog) {
    (loginDialog as any).show();
  }
});
