import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBL2NbPtDpNTg9A8O7Ry6CvRtIIcsP_cR0",
    authDomain: "denuncia-ghpc.firebaseapp.com",
    projectId: "denuncia-ghpc",
    storageBucket: "denuncia-ghpc.firebasestorage.app",
    messagingSenderId: "631206782173",
    appId: "1:631206782173:web:a8435c641baefadbb86734"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = "login.html";
    else carregarDados();
});

function carregarDados() {
    const q = query(collection(db, "denuncias"), orderBy("dataCriacao", "desc"));
    onSnapshot(q, (snapshot) => {
        const lista = document.getElementById('listaDenuncias');
        lista.innerHTML = "";
        
        if (snapshot.empty) {
            lista.innerHTML = "<p style='text-align:center;'>Nenhuma denúncia encontrada.</p>";
            return;
        }

        snapshot.forEach((docSnap) => {
            const d = docSnap.data();
            const id = docSnap.id;
            const card = document.createElement('div');
            // Usando classes que definiremos no style.css
            card.className = `card-denuncia ${d.status}`;
            card.innerHTML = `
                <div style="margin-bottom: 10px;">
                    <span class="badge bg-${d.status}">${d.status}</span>
                    <strong style="display:block;">Protocolo: ${d.protocolo}</strong>
                </div>
                <p style="margin: 10px 0; font-size: 0.9rem; color: #333;">${d.relato}</p>
                <small style="color: #7f8c8d;">Local: ${d.local || 'Não informado'}</small>
                
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <select onchange="mudarStatus('${id}', this.value)" style="flex: 3; margin-top:0;">
                        <option value="pendente" ${d.status==='pendente'?'selected':''}>Pendente</option>
                        <option value="tratamento" ${d.status==='tratamento'?'selected':''}>Em Tratamento</option>
                        <option value="resolvido" ${d.status==='resolvido'?'selected':''}>Resolvido</option>
                    </select>
                    
                    <button onclick="excluirTicket('${id}')" style="flex: 1; background: #e74c3c; padding: 5px; font-size: 0.8rem;">
                        Excluir
                    </button>
                </div>
            `;
            lista.appendChild(card);
        });
    });
}

// Funções globais para serem acessadas pelo HTML dinâmico
window.mudarStatus = async (id, novo) => {
    try {
        await updateDoc(doc(db, "denuncias", id), { status: novo });
    } catch (e) { alert("Erro ao atualizar: " + e.message); }
};

window.excluirTicket = async (id) => {
    if (confirm("Deseja excluir permanentemente este ticket?")) {
        try {
            await deleteDoc(doc(db, "denuncias", id));
        } catch (e) { alert("Erro ao excluir: " + e.message); }
    }
};

document.getElementById('btnLogout').addEventListener('click', () => signOut(auth));