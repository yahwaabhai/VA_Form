const form = document.getElementById('vaForm');
const responseMessage = document.getElementById('responseMessage');
const submitButton = document.getElementById('submitButton');

// V V V V V V V V V V V V V V V V V V V V V V V V V V V V V V V V V V V
// !!! IMPORTANT: REPLACE THE LINE BELOW WITH YOUR ACTUAL WEB APP URL !!!
const scriptURL = 'https://script.google.com/macros/s/AKfycbyUI4fjvjpYBR_amY8UMPxTt667Td4dDODCbPhifWyF0x08Li6cFC8udl4FFQzxHY0GFg/exec';
// ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^

if (!scriptURL || scriptURL === 'YOUR_APPS_SCRIPT_WEB_APP_URL') {
    console.error("ERROR: Apps Script URL is not set in script.js!");
    alert("Configuration error: The form submission URL is not set correctly. Please contact the administrator.");
}

form.addEventListener('submit', e => {
    e.preventDefault(); // Stop browser from submitting the form traditionally

    if (!scriptURL || scriptURL === 'YOUR_APPS_SCRIPT_WEB_APP_URL') {
         responseMessage.textContent = 'Configuration error: Form cannot be submitted.';
         responseMessage.className = 'response-message error';
         responseMessage.style.display = 'block';
         return; // Stop the submission if URL is not set
    }

    // Disable button and show submitting text
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    // Clear previous messages and hide
    responseMessage.textContent = '';
    responseMessage.className = 'response-message'; // Reset classes
    responseMessage.style.display = 'none';

    // Use FormData to easily collect all form data
    const formData = new FormData(form);

    // Send data to Google Apps Script
    fetch(scriptURL, { method: 'POST', body: formData })
        .then(response => {
            if (!response.ok) {
                 // Check for non-2xx HTTP status codes
                 throw new Error(`Network response was not ok (Status: ${response.status})`);
            }
            return response.json(); // Parse the JSON response from Apps Script
         })
        .then(data => {
            console.log('Response from Apps Script:', data); // For debugging
            if (data.result === 'success') {
                // Success!
                form.reset(); // Clear the form fields
                responseMessage.textContent = 'Thank you! We have received your submission. We will contact you shortly.';
                responseMessage.className = 'response-message success'; // Add success class
            } else {
                // Error reported by Apps Script
                // Display the specific error if available, otherwise a generic message
                responseMessage.textContent = 'Submission Error: ' + (data.error || 'An unknown error occurred processing the data.');
                responseMessage.className = 'response-message error'; // Add error class
                console.error('Error reported by Apps Script:', data.error);
            }
        })
        .catch(error => {
            // Network error or other issue with the fetch call or response processing
            console.error('Fetch Error:', error);
            responseMessage.textContent = 'Submission Failed: Could not connect to the server or process the response. ' + error.message;
            responseMessage.className = 'response-message error'; // Add error class
        })
        .finally(() => {
            // Re-enable button and restore text regardless of success/failure
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Application';
            // Show the response message div
            responseMessage.style.display = 'block';
        });
});
