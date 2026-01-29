// ===== Firebase Configuration =====
const firebaseConfig = {
    apiKey: "AIzaSyBSqkaYW6UbxyaLHPLZvfhaIIJFOvPeYN0",
    authDomain: "h-agency-recruitment.firebaseapp.com",
    databaseURL: "https://h-agency-recruitment-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "h-agency-recruitment",
    storageBucket: "h-agency-recruitment.firebasestorage.app",
    messagingSenderId: "198153569809",
    appId: "1:198153569809:web:3e018109dba4db014793b0",
    measurementId: "G-M6E1KP1FYL"
};

// ===== EmailJS Configuration =====
const emailConfig = {
    publicKey: 'O-BQd21qI2bb3nmLw',
    serviceId: 'service_dti8686',
    templateId: 'template_vd6ntbd',
    recipientEmail: 'jeejunhong@gmail.com'
};

// ===== Initialize Firebase =====
let database;

function initFirebase() {
    // Check if Firebase SDK is loaded
    if (typeof firebase === 'undefined') {
        console.warn('⏳ Waiting for Firebase SDK...');
        setTimeout(initFirebase, 100);
        return;
    }
    
    try {
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        console.log('✓ Firebase initialized successfully');
        
        // Export after Firebase is initialized
        window.appConfig = {
            firebase: firebaseConfig,
            email: emailConfig,
            database: database
        };
        
        // Trigger custom event to notify other scripts
        window.dispatchEvent(new Event('firebaseReady'));
        
    } catch (error) {
        console.error('✗ Firebase initialization error:', error);
    }
}

// Start Firebase initialization
initFirebase();

// ===== Initialize EmailJS =====
// Only initialize if EmailJS SDK is available (main website)
function initEmailJS() {
    if (typeof emailjs !== 'undefined' && emailConfig.publicKey) {
        try {
            emailjs.init(emailConfig.publicKey);
            console.log('✓ EmailJS initialized successfully');
        } catch (error) {
            console.error('✗ EmailJS initialization error:', error);
        }
    } else {
        // EmailJS not available, that's okay (admin panel doesn't need it)
        console.log('ℹ EmailJS SDK not loaded (not needed for admin panel)');
    }
}

// Wait a bit for EmailJS SDK to load, then initialize
setTimeout(initEmailJS, 100);
