document.getElementById('paymentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const amount = document.getElementById('amount').value * 100; // Convert to kobo
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    
    // Make API call to your backend to initialize payment
    fetch('/initialize-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            amount,
            firstName,
            lastName
        })
    })
    .then(response => response.json())
    .then(data => {
        if(data.status) {
            // Use Paystack's inline popup
            const handler = PaystackPop.setup({
                key: data.data.key, // Your public key from the backend
                email: data.data.email,
                amount: data.data.amount,
                ref: data.data.reference,
                firstname: data.data.firstName,
                lastname: data.data.lastName,
                callback: function(response) {
                    // Verify the payment
                    fetch(`/verify-payment?reference=${response.reference}`)
                        .then(response => response.json())
                        .then(data => {
                            if(data.status) {
                                alert('Payment complete! Reference: ' + data.data.reference);
                            } else {
                                alert('Payment verification failed');
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert('Error verifying payment');
                        });
                },
                onClose: function() {
                    alert('Payment window closed');
                }
            });
            handler.openIframe();
        } else {
            alert('Error initializing payment: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error processing payment');
    });
});
