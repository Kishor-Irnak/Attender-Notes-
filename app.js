// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-storage.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDNZ16gwzaWxVMY8EOvo2NekKeaJ_Zql1I",
    authDomain: "attend-61616.firebaseapp.com",
    projectId: "attend-61616",
    storageBucket: "attend-61616.appspot.com",
    messagingSenderId: "1022893657985",
    appId: "1:1022893657985:web:d1d9e0929b221c835da280",
    measurementId: "G-GP7RFCN0Z3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app, "gs://attend-61616.appspot.com");

// Upload PDF
async function uploadPDF() {
    const title = document.getElementById("pdfTitle").value;
    const file = document.getElementById("pdfFile").files[0];

    if (!title || !file) {
        alert("Please enter title and select a PDF file.");
        return;
    }

    const storageRef = ref(storage, `pdfs/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on("state_changed",
        (snapshot) => {
            // Progress indicator
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is ${progress}% done`);
        },
        (error) => {
            console.error("Upload failed:", error);
            alert("Upload failed! Check console for details.");
        },
        async () => {
            const fileURL = await getDownloadURL(storageRef);

            await addDoc(collection(db, "pdfs"), {
                title: title,
                url: fileURL
            });

            alert("PDF Uploaded Successfully!");
            document.getElementById("pdfTitle").value = "";
            document.getElementById("pdfFile").value = "";
            loadPDFs();
        }
    );
}

// Load PDFs from Firestore
async function loadPDFs() {
    const pdfList = document.getElementById("pdfList");
    pdfList.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "pdfs"));
    querySnapshot.forEach((doc) => {
        const { title, url } = doc.data();
        const li = document.createElement("li");
        li.classList = "flex justify-between items-center bg-gray-200 p-2 rounded mb-2";

        li.innerHTML = `
            <div class="flex items-center">
                <img src="https://cdn-icons-png.flaticon.com/512/337/337946.png" class="w-6 h-6 mr-2">
                <span>${title}</span>
            </div>
            <div>
                <a href="${url}" target="_blank" class="text-blue-500 mr-2">View</a>
                <a href="${url}" download class="text-green-500">Download</a>
            </div>
        `;
        pdfList.appendChild(li);
    });
}

// Load PDFs on page load
window.onload = loadPDFs;
