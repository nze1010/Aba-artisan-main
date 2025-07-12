import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, setDoc, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAZClfxJnvhMFZ4Y1Rpsfsu6LXwljrzjP8",
  authDomain: "aba-artisan.firebaseapp.com",
  projectId: "aba-artisan",
  storageBucket: "aba-artisan.appspot.com",
  messagingSenderId: "1024867712324",
  appId: "1:1024867712324:web:f9b7dfb127b1286a312b11",
  measurementId: "G-DPGB14RMV5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const roleSelect = document.getElementById("roleSelect");
const phoneInput = document.getElementById("phone");
const skillInput = document.getElementById("skill");
const artisanFields = document.querySelectorAll(".artisan-only");
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const dashboard = document.getElementById("dashboard");
const authCard = document.getElementById("authCard");
const welcomeText = document.getElementById("welcomeText");

roleSelect.addEventListener("change", () => {
  if (roleSelect.value === "artisan") {
    artisanFields.forEach(field => field.classList.remove("hidden"));
  } else {
    artisanFields.forEach(field => field.classList.add("hidden"));
  }
});

registerBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = roleSelect.value;
  const phone = phoneInput.value;
  const skill = skillInput.value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userData = {
      email,
      role
    };

    if (role === "artisan") {
      userData.phone = phone;
      userData.skill = skill;
    }

    await setDoc(doc(db, "users", user.uid), userData);
    alert("Registered successfully!");
  } catch (error) {
    alert("Registration error: " + error.message);
  }
});

loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const docSnap = await getDoc(doc(db, "users", user.uid));
    const userData = docSnap.data();
    showDashboard(userData.email, userData.role, userData);
  } catch (error) {
    alert("Login error: " + error.message);
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  authCard.classList.remove("hidden");
  dashboard.classList.add("hidden");
});

function showDashboard(email, role, data) {
  authCard.classList.add("hidden");
  dashboard.classList.remove("hidden");
  welcomeText.innerText = `Welcome ${email} (${role})`;

  const dashTabs = document.getElementById("dashTabs");
  const dashContent = document.getElementById("dashContent");

  dashTabs.innerHTML = "";
  dashContent.innerHTML = "";

  if (role === "admin") {
    dashTabs.innerHTML = `<li class="nav-item"><a class="nav-link active" id="adminTab" href="#">Admin Panel</a></li>`;
    dashContent.innerHTML = `<p>You are logged in as Admin.</p>`;
  } else if (role === "artisan") {
    dashTabs.innerHTML = `<li class="nav-item"><a class="nav-link active" id="profileTab" href="#">My Portfolio</a></li>`;
    dashContent.innerHTML = `
      <p><strong>Skill:</strong> ${data.skill || "N/A"}</p>
      <p><strong>Phone:</strong> ${data.phone || "N/A"}</p>
    `;
  } else {
    dashTabs.innerHTML = `<li class="nav-item"><a class="nav-link active" id="artisanListTab" href="#">Find Artisans</a></li>`;
    fetchArtisans(dashContent);
  }
}

async function fetchArtisans(container) {
  container.innerHTML = "<p>Loading artisans...</p>";
  const querySnapshot = await getDocs(collection(db, "users"));
  let listHTML = "";

  querySnapshot.forEach(doc => {
    const user = doc.data();
    if (user.role === "artisan") {
      listHTML += `
        <div class="card mb-3 p-3">
          <h5>${user.skill}</h5>
          <p><strong>Phone:</strong> <a href="tel:${user.phone}">${user.phone}</a></p>
          <p><strong>Email:</strong> ${user.email}</p>
        </div>
      `;
    }
  });

  container.innerHTML = listHTML || "<p>No artisans found.</p>";
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const docSnap = await getDoc(doc(db, "users", user.uid));
    const userData = docSnap.data();
    showDashboard(userData.email, userData.role, userData);
  }
});
