const form = document.getElementById('vaForm');
const responseMessage = document.getElementById('responseMessage');
const submitButton = document.getElementById('submitButton');
const buttonText = submitButton.querySelector('.button-text');
const spinner = submitButton.querySelector('.spinner');

// V V V V V V V V V V V V V V V V V V V V V V V V V V V V V V V V V V V
// !!! IMPORTANT: REPLACE THE LINE BELOW WITH YOUR ACTUAL WEB APP URL !!!
const scriptURL = 'https://script.google.com/macros/s/AKfycbyUI4fjvjpYBR_amY8UMPxTt667Td4dDODCbPhifWyF0x08Li6cFC8udl4FFQzxHY0GFg/exec';
// ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^

// Basic Email Validation Regex
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Function to show error messages for specific fields
function showValidationError(fieldId, message) {
    const errorDiv = document.getElementById(fieldId + 'Error');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
    const inputField = document.getElementById(fieldId);
    if (inputField) {
       inputField.setAttribute('aria-invalid', 'true');
    }
}

// Function to clear all validation errors
function clearValidationErrors() {
    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(msg => {
        msg.textContent = '';
        msg.style.display = 'none';
    });
     const invalidFields = form.querySelectorAll('[aria-invalid="true"]');
    invalidFields.forEach(field => field.removeAttribute('aria-invalid'));
}

// Client-side validation function
function validateForm() {
    clearValidationErrors();
    let isValid = true;

    // Check required fields
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            showValidationError(field.id, `${field.previousElementSibling.textContent.replace(':','')} is required.`);
        }
    });

    // Check email format
    const emailField = document.getElementById('email');
    if (emailField.value.trim() && !emailPattern.test(emailField.value.trim())) {
         isValid = false;
         showValidationError(emailField.id, 'Please enter a valid email address.');
    }

    // Add more specific validation here if needed (e.g., phone format)

    return isValid;
}


// Check if URL is configured on load
if (!scriptURL || scriptURL === 'YOUR_APPS_SCRIPT_WEB_APP_URL') {
    console.error("ERROR: Apps Script URL is not set in script.js!");
    responseMessage.textContent = 'Configuration error: The form cannot be submitted. Please contact the administrator.';
    responseMessage.className = 'response-message error';
    responseMessage.style.display = 'block';
    if(submitButton) submitButton.disabled = true; // Disable submit if misconfigured
}

form.addEventListener('submit', e => {
    e.preventDefault(); // Stop browser from submitting the form traditionally

    // Honeypot Check
    const honeypot = form.querySelector('[name="honeypot_field"]');
    if (honeypot && honeypot.value) {
        console.log("Honeypot field filled, likely bot submission.");
        // Optionally show a generic success message to confuse bots
        // responseMessage.textContent = 'Thank you! We have received your submission.';
        // responseMessage.className = 'response-message success';
        // responseMessage.style.display = 'block';
        return; // Silently stop processing
    }

    // Client-side validation
    if (!validateForm()) {
        responseMessage.textContent = 'Please correct the errors above.';
        responseMessage.className = 'response-message error';
        responseMessage.style.display = 'block';
        return; // Stop submission if validation fails
    }


    // Disable button and show submitting state
    submitButton.disabled = true;
    buttonText.textContent = 'Submitting...';
    spinner.style.display = 'inline-block'; // Show spinner

    // Clear previous main response messages and hide
    responseMessage.textContent = '';
    responseMessage.className = 'response-message'; // Reset classes
    responseMessage.style.display = 'none';

    // Use FormData to easily collect all form data
    const formData = new FormData(form);

    // Send data to Google Apps Script
    fetch(scriptURL, { method: 'POST', body: formData })
        .then(response => {
            // Check if the response status indicates success (e.g., 2xx)
            // Also check content type if possible, expecting JSON
            if (!response.ok) {
                 // Try to get error details if server sent any meaningful response body
                 return response.text().then(text => {
                    throw new Error(`Network response was not ok (Status: ${response.status}). Server response: ${text}`);
                 });
            }
            // Assuming Apps Script always returns JSON, even for errors it controls
             return response.json();
         })
        .then(data => {
            console.log('Response from Apps Script:', data); // For debugging
            if (data.result === 'success') {
                // Success!
                form.reset(); // Clear the form fields
                responseMessage.textContent = 'Thank you! We have received your submission. We will contact you shortly.';
                responseMessage.className = 'response-message success'; // Add success class
            } else {
                // Error explicitly reported by Apps Script logic (e.g., validation fail)
                responseMessage.textContent = 'Submission Error: ' + (data.error || 'An unknown error occurred processing the data.');
                responseMessage.className = 'response-message error'; // Add error class
                console.error('Error reported by Apps Script:', data.error);
            }
        })
        .catch(error => {
            // Network error, fetch issue, JSON parsing error, or non-ok HTTP status
            console.error('Submission Process Error:', error);
            // Provide a more user-friendly message for common network issues
            let userErrorMessage = 'Submission Failed: Could not complete the request.';
            if (error.message.includes('Failed to fetch')) {
                userErrorMessage = 'Submission Failed: Check your network connection and try again.';
            } else if (error.message.includes('Network response was not ok')) {
                 userErrorMessage = 'Submission Failed: There was a problem communicating with the server. Please try again later.';
                 // Optionally log the detailed server response from the error message
                 console.error("Detailed Server Error:", error.message);
            }
            responseMessage.textContent = userErrorMessage;
            responseMessage.className = 'response-message error'; // Add error class
        })
        .finally(() => {
            // Re-enable button and restore text/hide spinner regardless of success/failure
            submitButton.disabled = false;
            buttonText.textContent = 'Submit Application';
            spinner.style.display = 'none'; // Hide spinner
            // Show the response message div
            responseMessage.style.display = 'block';
        });
});

// Optional: Clear validation message when user starts typing in a field again
form.querySelectorAll('input[required], textarea[required]').forEach(input => {
    input.addEventListener('input', () => {
        const errorDiv = document.getElementById(input.id + 'Error');
        if (errorDiv && errorDiv.style.display === 'block') {
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
            input.removeAttribute('aria-invalid');
        }
         // Optionally clear the main response message too
        // if (responseMessage.style.display === 'block') {
        //     responseMessage.style.display = 'none';
        // }
    });
});
