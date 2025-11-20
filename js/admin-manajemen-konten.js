const API_BASE_URL = 'http://localhost:3000/api'; 

document.addEventListener('DOMContentLoaded', () => {
    const dataContainer = document.getElementById('data-container');
    let currentContentData = null; 
    let isEditing = false; // Status untuk Inline Edit

    const stringToUl = (text) => {
        const items = text.split('\n').map(s => s.trim()).filter(s => s.length > 0);
        if (items.length === 0) return '';
        
        let ulHtml = '<ul class="list-disc list-inside">';
        items.forEach(item => {
            const safeItem = item.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            ulHtml += `<li>${safeItem}</li>`;
        });
        ulHtml += '</ul>';
        return ulHtml;
    };

    const ulToString = (ulElement) => {
        const ul = ulElement.querySelector('ul');
        if (!ul) return ulElement.textContent.trim();
        return Array.from(ul.querySelectorAll('li')).map(li => li.textContent.trim()).join('\n');
    };
    
    const renderContentData = (data) => {
        if (!dataContainer) return;
        
        dataContainer.innerHTML = ''; 
        currentContentData = data; 

        const keunggulanHtml = stringToUl(data.keunggulan || ''); 
        const row = document.createElement('tr');
        row.id = `row-utama`; 
        
        // Tambahkan ID ke setiap kolom untuk memudahkan referensi
        row.innerHTML = `
            <td id="td-tentang-kami" class="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs align-top">${data.tentang_kami || ''}</td>
            <td id="td-visi" class="px-6 py-4 text-sm text-gray-700 max-w-xs align-top">${data.visi || ''}</td>
            <td id="td-keunggulan" class="px-6 py-4 text-sm text-gray-700 max-w-xs align-top">${keunggulanHtml}</td>
            <td id="td-slogan" class="px-6 py-4 text-sm text-gray-700 max-w-xs align-top">${data.slogan || ''}</td>
            <td id="td-actions" class="px-6 py-4 text-right text-sm font-medium align-top action-cell">
                <button id="inline-edit-btn" class="text-indigo-600 hover:text-indigo-900 mr-3 edit-btn">Edit</button>
                </td>
        `;
        dataContainer.appendChild(row);

        // Pasang event listener untuk tombol Edit/Save
        document.getElementById('inline-edit-btn')?.addEventListener('click', handleToggleEdit);
    };

    const fetchData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/konten`);
            if (!response.ok && response.status !== 404) {
                throw new Error('Gagal mengambil data konten dari API.');
            }
            const result = await response.json();
            
            if (response.status === 404 || !result.success) {
                 renderContentData({ tentang_kami: '', visi: '', keunggulan: '', slogan: '' });
                 return;
            }

            if (result.success) {
                renderContentData(result.data);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            renderContentData({ tentang_kami: '', visi: '', keunggulan: '', slogan: '' });
            alert('PERHATIAN: Koneksi ke server API gagal. Data yang ditampilkan mungkin tidak terbarui.');
        }
    };

    const handleToggleEdit = () => {
        const btn = document.getElementById('inline-edit-btn');
        const tdTentang = document.getElementById('td-tentang-kami');
        const tdVisi = document.getElementById('td-visi');
        const tdKeunggulan = document.getElementById('td-keunggulan');
        const tdSlogan = document.getElementById('td-slogan');

        const editableFields = [tdTentang, tdVisi, tdSlogan];
        // Keunggulan memerlukan penanganan khusus karena berisi UL/LI
        
        if (!isEditing) {
            // Mode EDITING: Aktifkan contenteditable dan ubah tombol menjadi Simpan
            isEditing = true;
            btn.textContent = 'Simpan';
            btn.classList.remove('text-indigo-600');
            btn.classList.add('text-green-600');
            
            // 1. Aktifkan editing pada kolom teks
            editableFields.forEach(td => {
                td.setAttribute('contenteditable', 'true');
                td.classList.add('border', 'border-indigo-400', 'bg-indigo-50/50'); 
            });

            // 2. Tangani Keunggulan: Ubah UL menjadi teks biasa (dipisahkan baris baru)
            tdKeunggulan.setAttribute('contenteditable', 'true');
            tdKeunggulan.classList.add('border', 'border-indigo-400', 'bg-indigo-50/50');
            tdKeunggulan.innerHTML = ulToString(tdKeunggulan);

            tdTentang.focus();

        } else {
            // Mode SAVING: Kirim data ke API dan nonaktifkan contenteditable
            
            const newTentangKami = tdTentang.textContent.trim();
            const newVisi = tdVisi.textContent.trim();
            const newKeunggulan = tdKeunggulan.textContent.trim(); // Simpan sebagai teks biasa
            const newSlogan = tdSlogan.textContent.trim();

            const dataToUpdate = {
                tentang_kami: newTentangKami,
                visi: newVisi,
                keunggulan: newKeunggulan, // Kirim teks biasa
                slogan: newSlogan
            };

            // Panggil fungsi simpan
            handleSave(dataToUpdate, btn, [tdTentang, tdVisi, tdKeunggulan, tdSlogan]);
        }
    };
    
    const handleSave = async (dataToUpdate, btnElement, allFields) => {
        // Nonaktifkan tombol saat proses simpan
        btnElement.disabled = true;
        btnElement.textContent = 'Menyimpan...';

        try {
            const response = await fetch(`${API_BASE_URL}/konten`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToUpdate)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Berhasil: Nonaktifkan mode editing
                isEditing = false;
                btnElement.textContent = 'Edit';
                btnElement.classList.remove('text-green-600');
                btnElement.classList.add('text-indigo-600');

                // Nonaktifkan editing pada semua kolom
                allFields.forEach(td => {
                    td.setAttribute('contenteditable', 'false');
                    td.classList.remove('border', 'border-indigo-400', 'bg-indigo-50/50');
                });
                
                // Update tampilan Keunggulan kembali ke format UL
                document.getElementById('td-keunggulan').innerHTML = stringToUl(dataToUpdate.keunggulan);
                
                alert(`Data konten berhasil diperbarui.`);
            } else {
                alert(`Gagal menyimpan data: ${result.message || 'Error tidak diketahui'}. Silakan coba lagi.`);
            }

        } catch (error) {
            console.error('Fetch Save Error:', error);
            alert('Koneksi ke server gagal saat menyimpan data. Data tidak tersimpan.');
        } finally {
            btnElement.disabled = false;
            // Jika ada kegagalan, biarkan tombol tetap "Simpan" (Mode Editing tetap aktif)
            if (!isEditing) {
                 btnElement.textContent = 'Edit'; 
                 btnElement.classList.remove('text-green-600');
                 btnElement.classList.add('text-indigo-600');
            }
        }
    };

    fetchData();
});