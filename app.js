import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp, 
    query, 
    where, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBL2NbPtDpNTg9A8O7Ry6CvRtIIcsP_cR0",
    authDomain: "denuncia-ghpc.firebaseapp.com",
    projectId: "denuncia-ghpc",
    storageBucket: "denuncia-ghpc.firebasestorage.app",
    messagingSenderId: "631206782173",
    appId: "1:631206782173:web:a8435c641baefadbb86734"
};

// Inicializa Firebase e Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Seleção de Elementos
const form = document.getElementById('denunciaForm');
const sucessoMsg = document.getElementById('sucessoMsg');
const protocoloNum = document.getElementById('protocoloNum');
const btnConsultar = document.getElementById('btnConsultar');
const inputProtocolo = document.getElementById('inputProtocolo');
const resultadoConsulta = document.getElementById('resultadoConsulta');
const statusTexto = document.getElementById('statusTexto');
const dataAtualizacao = document.getElementById('dataAtualizacao');

// --- Lógica de Envio ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('btnEnviar');
    btn.disabled = true;
    btn.innerText = "Enviando...";

    const dadosDenuncia = {
        categoria: document.getElementById('categoria').value,
        relato: document.getElementById('relato').value,
        local: document.getElementById('local').value,
        protocolo: Math.random().toString(36).substring(2, 8).toUpperCase(),
        status: "pendente",
        dataCriacao: serverTimestamp()
    };

    try {
        await addDoc(collection(db, "denuncias"), dadosDenuncia);
        form.classList.add('hidden');
        // Esconde a parte de consulta também para focar no sucesso
        document.querySelector('.consulta-container').classList.add('hidden');
        sucessoMsg.classList.remove('hidden');
        protocoloNum.innerText = dadosDenuncia.protocolo;
        
    } catch (error) {
        console.error("Erro ao enviar denúncia: ", error);
        alert("Erro ao enviar. Verifique se as regras do Firestore permitem gravação pública.");
        btn.disabled = false;
        btn.innerText = "Enviar Denúncia Anônima";
    }
});

// --- Lógica de Consulta ---
btnConsultar.addEventListener('click', async () => {
    const codigo = inputProtocolo.value.trim().toUpperCase();
    
    if (!codigo) {
        alert("Digite um protocolo.");
        return;
    }

    try {
        const q = query(collection(db, "denuncias"), where("protocolo", "==", codigo));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            alert("Protocolo não encontrado.");
            resultadoConsulta.classList.add('hidden');
            return;
        }

        querySnapshot.forEach((doc) => {
            const dados = doc.data();
            statusTexto.innerText = dados.status;
            
            if (dados.dataCriacao) {
                const data = dados.dataCriacao.toDate();
                dataAtualizacao.innerText = data.toLocaleDateString('pt-BR');
            }
            
            resultadoConsulta.classList.remove('hidden');
        });
    } catch (error) {
        console.error("Erro na consulta:", error);
        alert("Erro ao buscar. Verifique sua conexão.");
    }
});