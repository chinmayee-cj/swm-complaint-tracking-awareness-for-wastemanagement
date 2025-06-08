console.log('script.js loaded and running');

const API_URL = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', () => {
  // === Image Preview Logic ===
  const imageInput = document.getElementById('image');
  const preview = document.getElementById('imagePreview');

  if (imageInput && preview) {
    imageInput.addEventListener('change', () => {
      const file = imageInput.files[0];
      if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
      } else {
        preview.style.display = 'none';
      }
    });
  }

  // === Submit Complaint ===
  const complaintForm = document.getElementById('complaintForm');
  if (complaintForm) {
    complaintForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(complaintForm); // includes all fields including image

      try {
        const res = await fetch(`${API_URL}/complaints`, {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        const msg = document.getElementById('submitMessage');

        if (res.ok) {
          msg.innerHTML = `<p class="message">✅ Complaint submitted! Your ID: <strong>${data.complaintId}</strong></p>`;
          if (preview) preview.style.display = 'none';
        } else {
          msg.innerHTML = `<p class="error">❌ ${data.error || 'Submission failed'}</p>`;
        }
      } catch (error) {
        const msg = document.getElementById('submitMessage');
        msg.innerHTML = `<p class="error">❌ Network error: ${error.message}</p>`;
      }
    });
  }

  // === Track Complaint ===
  const trackForm = document.getElementById('trackForm');
  if (trackForm) {
    trackForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const trackIdInput = document.getElementById('trackId');
      const result = document.getElementById('trackResult');

      if (!trackIdInput || !result) return;

      const trackId = trackIdInput.value.trim();

      if (!trackId) {
        result.innerHTML = `<p class="error">❌ Please enter a complaint ID.</p>`;
        return;
      }

      try {
        const res = await fetch(`${API_URL}/complaints/${trackId}`);
        const data = await res.json();

        if (res.ok) {
          result.innerHTML = `
            <h3>Complaint Details</h3>
            <p><strong>ID:</strong> ${data.complaintId}</p>
            <p><strong>Description:</strong> ${data.description}</p>
            <p><strong>Location:</strong> ${data.location}</p>
            <p><strong>Category:</strong> ${data.category}</p>
            <p><strong>Status:</strong> ${data.status}</p>
            <p><strong>Submitted on:</strong> ${new Date(data.createdAt).toLocaleString()}</p>
            ${data.imagePath ? `<p><strong>Image:</strong><br><img src="${API_URL}/${data.imagePath}" style="max-width:300px; margin-top:10px;"></p>` : ''}
          `;
        } else {
          result.innerHTML = `<p class="error">❌ ${data.error || 'Complaint not found'}</p>`;
        }
      } catch (error) {
        result.innerHTML = `<p class="error">❌ Network error: ${error.message}</p>`;
      }
    });
  }
});
