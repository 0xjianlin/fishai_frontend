<template>
  <div class="fish-identifier">
    <h2>Advanced Fish Identification</h2>
    
    <!-- Mode Selector -->
    <div class="mode-selector">
      <label>
        <input type="radio" value="identify" v-model="mode" /> Identify Fish
      </label>
      <label>
        <input type="radio" value="species" v-model="mode" /> All Species List
      </label>
    </div>

    <!-- Identify Fish Mode -->
    <div v-if="mode === 'identify'">
      <!-- Upload Form -->
      <form @submit.prevent="submitBatch" class="form-area">
        <div
          class="drop-area"
          @dragover.prevent
          @drop.prevent="onDropFiles"
          @click="triggerFileInput"
        >
          <span v-if="!selectedFiles.length">
            Click or drag multiple images here for batch identification
          </span>
          <span v-else>{{ selectedFiles.length }} file(s) selected</span>
          <input
            type="file"
            ref="fileInput"
            @change="onFilesChange"
            accept="image/*"
            multiple
            style="display:none"
          />
        </div>
        <div class="button-row">
          <button type="submit" class="main-btn" :disabled="!selectedFiles.length || loading">
            <span v-if="!loading">🔍 Identify Fish (Batch)</span>
            <span v-else>Processing...</span>
          </button>
          <button type="button" class="reset-btn" @click="resetForm" :disabled="loading">⟲ Reset</button>
        </div>
      </form>

      <!-- Image Preview -->
      <div v-if="selectedFiles.length" class="preview-list">
        <div v-for="(file, idx) in selectedFiles" :key="idx" class="preview-block">
          <img
            :src="filePreviews[idx]"
            :alt="file.name"
            class="preview-img"
            @click="openImageModal(filePreviews[idx])"
          />
          <div class="preview-name" :title="file.name">{{ file.name }}</div>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div v-if="loading" class="spinner-container">
        <div class="spinner"></div>
        <div>Identifying fish in batch...</div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="error"><strong>Error:</strong> {{ error }}</div>
      
      <!-- Success Message -->
      <div v-if="showSuccess" class="success">Identification complete!</div>

      <!-- Results Display -->
      <div v-if="results.length">
        <h3>Results:</h3>
        <div class="results-container">
          <div v-for="(imageResult, idx) in results" :key="idx" class="result-block">
            <div class="result-header">
              {{ imageResult.filename || selectedFiles[idx]?.name }}
            </div>
            <img
              v-if="filePreviews[idx]"
              :src="filePreviews[idx]"
              :alt="imageResult.filename || selectedFiles[idx]?.name"
              class="result-img"
              @click="openImageModal(filePreviews[idx])"
            />
            <div v-if="imageResult.success">
              <div v-if="imageResult.detections && imageResult.detections.length" class="predictions">
                <div v-for="(detection, dIdx) in imageResult.detections" :key="dIdx" class="species-result-row">
                  <img
                    class="species-result-img"
                    :src="detection.image_url || 'https://res.cloudinary.com/dtz92sayc/image/upload/v1751039809/fish_images/ofioj3ku15l2rz5t9e24.png'"
                    alt="Species image"
                    @click="openImageModal(detection.image_url || 'https://res.cloudinary.com/dtz92sayc/image/upload/v1751039809/fish_images/ofioj3ku15l2rz5t9e24.png')"
                  />
                  <div class="species-result-content">
                    <div class="species-names-row">
                      <span class="common_name">{{ detection.common_name }}</span>
                      <button
                        v-if="detection.more_info && Object.keys(detection.more_info).length > 0"
                        class="info-icon-btn"
                        @click="openSpeciesModal(detection.more_info)"
                        title="More Info"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" height="18" width="18" viewBox="0 0 24 24" fill="none" stroke="#1976d2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/></svg>
                      </button>
                    </div>
                    <div class="scientific_name"><em>{{ detection.scientific_name }}</em></div>
                    <div class="confidence-bar-container">
                      <div class="confidence-bar-bg">
                        <div
                          class="confidence-bar-fill"
                          :style="{ width: ((detection.confidence || 0) * 100) + '%' }"
                        ></div>
                        <span class="confidence-bar-label-center">
                          {{ parseInt((detection.confidence || 0) * 100, 10) }}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="no-result">No fish species detected with high confidence.</div>
              </div>
            <div v-else>
              <span class="error">{{ imageResult.error || 'Error processing image.' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Species Info Modal -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <div v-if="modalLoading">Loading species info...</div>
          <div v-else-if="modalError" class="error">{{ modalError }}</div>
          <template v-else>
            <h2>{{ modalSpeciesInfo?.name }}</h2>
            <div><em>{{ modalSpeciesInfo?.scientific_name }}</em></div>
            <div class="modal-section"><strong>Common Name:</strong> {{ modalSpeciesInfo?.species }}</div>
            <div class="modal-section"><strong>Scientific Name:</strong> {{ modalSpeciesInfo?.latin_name }}</div>
            <div class="modal-section"><strong>Regulations:</strong> {{ modalSpeciesInfo?.regulatory_reference }}</div>
            <div class="modal-section"><strong>Daily Bag Limit:</strong> {{ modalSpeciesInfo?.daily_bag_limit }}</div>
            <div class="modal-section"><strong>Minimum Size Limit:</strong> {{ modalSpeciesInfo?.minimum_size_limit }}</div>
            <div class="modal-section"><strong>Season:</strong>
              <ul>
                <li v-for="(season, sIdx) in modalSpeciesInfo?.season" :key="sIdx">
                  {{ season.description }} ({{ season.start_date }} - {{ season.end_date }})
                </li>
              </ul>
            </div>
          </template>
        </div>
      </div>

      <!-- Image Modal -->
      <div v-if="showImageModal" class="modal-overlay" @click.self="closeImageModal">
        <div class="image-modal">
          <img :src="currentImage" alt="Preview" class="modal-img-only" />
        </div>
      </div>
    </div>

    <!-- Species List Mode -->
    <div v-else>
      <div class="species-list-header">
        <input
          v-model="speciesSearch"
          class="species-search"
          type="text"
          placeholder="Search species by name or scientific name..."
        />
        <button @click="fetchSpeciesList" class="main-btn">🔄 Refresh List</button>
      </div>
      <div v-if="speciesLoading" class="spinner-container">
        <div class="spinner"></div>
        <div>Loading species list...</div>
      </div>
      <div v-if="speciesList.length && !speciesLoading" class="species-grid">
        <div
          v-for="(species, idx) in filteredSpecies"
          :key="idx"
          class="species-card"
        >
          <img
            :src="species.image_url || 'https://res.cloudinary.com/dtz92sayc/image/upload/v1751039809/fish_images/ofioj3ku15l2rz5t9e24.png'"
            alt="Species image"
            class="species-image cursor-pointer"
            @click.stop="openSpeciesImageModal(species.image_url || 'https://res.cloudinary.com/dtz92sayc/image/upload/v1751039809/fish_images/ofioj3ku15l2rz5t9e24.png')"
          />
          <div class="species-card-content">
            <div class="species-common">{{ idx + 1 }}. Common Name: {{ species.name }}</div>
            <div class="species-sci"><em>Scientific Name: {{ species.species_id }}</em></div>
            <div v-if="species.location" class="species-sci"><em>Location: {{ species.location }}</em></div>
            <div class="regulation-info" style="margin-top: 8px;">
              <template v-if="species.more_info && Object.keys(species.more_info).length">
                <div><strong>Regulations:</strong> {{ species.more_info.regulatory_reference }}</div>
                <div><strong>Daily Bag Limit:</strong> {{ species.more_info.daily_bag_limit }}</div>
                <div><strong>Minimum Size Limit:</strong> {{ species.more_info.minimum_size_limit }}</div>
                <div><strong>Season:</strong>
                  <ul>
                    <li v-for="(season, sIdx) in species.more_info.season" :key="sIdx">
                      {{ season.description }} ({{ season.start_date }} - {{ season.end_date }})
                    </li>
                  </ul>
                </div>
              </template>
              <template v-else>
                <em>No regulation info found.</em>
              </template>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="species-empty">
        <em>No species found. Click 'Refresh List' to load.</em>
      </div>

      <!-- Species List Image Modal -->
      <div v-if="showSpeciesImageModal" class="modal-overlay fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" @click.self="closeSpeciesImageModal">
        <div class="image-modal bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-2xl max-w-4xl w-full border border-cyan-400/30">
          <img :src="speciesImage" alt="Preview" class="modal-img-only max-w-full max-h-[80vh] object-contain rounded-lg mx-auto" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FishIdentifier',
  data() {
    return {
      mode: 'identify',
      selectedFiles: [],
      filePreviews: [],
      results: [],
      loading: false,
      error: '',
      showSuccess: false,
      showModal: false,
      modalSpeciesInfo: {},
      showImageModal: false,
      currentImage: null,
      modalLoading: false,
      modalError: '',
      speciesList: [],
      speciesSearch: '',
      speciesLoading: false,
      showSpeciesImageModal: false,
      speciesImage: null
    };
  },
  computed: {
    filteredSpecies() {
      let filtered = this.speciesList;
      if (this.speciesSearch) {
        const q = this.speciesSearch.toLowerCase();
        filtered = filtered.filter(
          s =>
            s.name.toLowerCase().includes(q) ||
            (s.name && s.name.toLowerCase().includes(q))
        );
      }
      // Sort by species name A → Z
      return filtered.slice().sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    }
  },
  watch: {
    mode(newMode) {
      if (newMode === 'species') {
        this.fetchSpeciesList();
      }
    }
  },
  methods: {
    onFilesChange(e) {
      this.handleFiles(e.target.files);
    },
    onDropFiles(e) {
      this.handleFiles(e.dataTransfer.files);
    },
    handleFiles(fileList) {
      const files = Array.from(fileList);
      this.selectedFiles = files;
      this.results = [];
      this.error = '';
      this.showSuccess = false;
      this.filePreviews = Array(files.length); // pre-size the array

      files.forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          // Vue 3 reactivity handles this fine — no need for this.$set
          this.filePreviews[idx] = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    async submitBatch() {
      if (!this.selectedFiles.length) return;
      this.loading = true;
      this.error = '';
      this.results = [];
      this.showSuccess = false;
      try {
        const formData = new FormData();
        this.selectedFiles.forEach(file => {
          formData.append('files', file);
        });
        const response = await fetch(`${process.env.VUE_APP_API_URL}/identify`, {
          method: 'POST',
          body: formData
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        this.results = data.results;
        this.showSuccess = true;
      } catch (err) {
        this.error = err.message || 'Failed to process images.';
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.selectedFiles = [];
      this.filePreviews = [];
      this.results = [];
      this.error = '';
      this.loading = false;
      this.showSuccess = false;
      this.$refs.fileInput && (this.$refs.fileInput.value = null);
    },
    async openSpeciesModal(moreInfo) {
      this.showModal = true;
      this.modalLoading = true;
      this.modalError = '';
      this.modalSpeciesInfo = {};
      try {
        this.modalSpeciesInfo = moreInfo;
      } catch (err) {
        this.modalError = err.message || 'Failed to fetch species info.';
      } finally {
        this.modalLoading = false;
      }
    },
    closeModal() {
      this.showModal = false;
    },
    openImageModal(img) {
      this.currentImage = img;
      this.showImageModal = true;
    },
    closeImageModal() {
      this.showImageModal = false;
      this.currentImage = null;
    },
    openSpeciesImageModal(img) {
      this.speciesImage = img;
      this.showSpeciesImageModal = true;
    },
    closeSpeciesImageModal() {
      this.showSpeciesImageModal = false;
      this.speciesImage = null;
    },
    async fetchSpeciesList() {
      this.speciesLoading = true;
      try {
        const response = await fetch(`${process.env.VUE_APP_API_URL}/species`);
        const data = await response.json();
        this.speciesList = data.species || [];
      } catch (err) {
        this.$notify({
          type: 'error',
          title: 'Error',
          text: 'Failed to fetch species list.'
        });
      } finally {
        this.speciesLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.fish-identifier {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Arial, sans-serif;
}

.form-area {
  margin-bottom: 20px;
}

.drop-area {
  border: 2px dashed #007bff;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s, background-color 0.3s;
  margin-bottom: 15px;
}

.drop-area:hover {
  border-color: #0056b3;
  background-color: #f8f9fa;
}

.button-row {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.main-btn, .reset-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.main-btn {
  background: #007bff;
  color: white;
}

.main-btn:hover:not(:disabled) {
  background: #0056b3;
}

.main-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.reset-btn {
  background: #6c757d;
  color: white;
}

.reset-btn:hover:not(:disabled) {
  background: #545b62;
}

.preview-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.preview-block {
  text-align: center;
}

.preview-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.preview-img:hover {
  transform: scale(1.05);
}

.preview-name {
  margin-top: 5px;
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spinner-container {
  text-align: center;
  padding: 40px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  background: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.success {
  background: #d4edda;
  color: #155724;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.results-container {
  margin-top: 20px;
}

.result-block {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.result-img {
  max-width: 300px;
  max-height: 200px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 15px;
}

.predictions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.species-result-row {
  display: flex;
  align-items: center;
  gap: 18px;
  min-height: 100px;
  margin-bottom: 18px;
  padding: 12px 0;
}

.species-result-img {
  width: 100px;
  height: 100px;
  object-fit: contain;
  border-radius: 10px;
  background: #f0f0f0;
  box-shadow: 0 1px 4px rgba(60,60,60,0.07);
}

.species-result-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.species-names-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.common_name {
  font-size: 1.3em;
  font-weight: 700;
  color: #2d3a4a;
}

.scientific_name {
  font-size: 1em;
  color: #6b7280;
  font-style: italic;
  margin-left: 0;
}

.confidence-bar-container {
  margin-top: 10px;
  width: 220px;
  max-width: 100%;
}

.info-icon-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-left: 4px;
}

.info-icon-btn svg {
  display: block;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.image-modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 90vw;
  max-height: 90vh;
}

.modal-img-only {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

.modal-section {
  margin: 10px 0;
}

h2, h3 {
  color: #333;
  margin-bottom: 15px;
}

.regulation-info {
  background: #f4f8fa;
  border-radius: 6px;
  padding: 8px 12px;
  margin-top: 4px;
  font-size: 14px;
}

.sci-name {
  color: #666;
  margin-left: 8px;
}

.mode-selector {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.species-list-header {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 18px;
}

.species-search {
  flex: 1;
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid #cfd8dc;
  font-size: 16px;
  background: #f8fafc;
  transition: border 0.2s;
}

.species-search:focus {
  border: 1.5px solid #1976d2;
  outline: none;
}

.species-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
}

.species-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(60, 60, 60, 0.07);
  padding: 18px 16px 14px 16px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  transition: box-shadow 0.2s;
}

.species-image {
  width: 120px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  margin-right: 18px;
  background: #f0f0f0;
}

.species-card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.species-common {
  font-weight: 600;
  font-size: 1.1em;
  color: #1976d2;
  margin-bottom: 4px;
}

.species-sci {
  color: #555;
  font-size: 0.98em;
}

.species-empty {
  margin-top: 24px;
  color: #888;
  text-align: center;
}

.clickable {
  cursor: pointer;
  transition: background 0.15s;
}
.clickable:hover {
  background: #e3f2fd;
}
.modal-content {
  background: #fff;
  border-radius: 10px;
  padding: 32px 28px 20px 28px;
  min-width: 320px;
  max-width: 95vw;
  box-shadow: 0 4px 32px rgba(25, 118, 210, 0.13);
  position: relative;
}
.modal-close {
  margin-top: 18px;
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.2s;
}
.modal-close:hover {
  background: #125ea7;
}

.confidence-bar-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 6px 0 10px 0;
  min-width: 120px;
  max-width: 220px;
}
.confidence-bar-bg {
  flex: 1;
  height: 18px;
  background: #f2f2f2;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}
.confidence-bar-fill {
  height: 100%;
  background: #43a047;
  border-radius: 10px 0 0 10px;
  transition: width 0.3s;
}
.confidence-bar-label-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.98em;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 2px #222, 0 0 2px #222;
  pointer-events: none;
  width: 100%;
  text-align: center;
}

@media (max-width: 768px) {
  .fish-identifier {
    padding: 10px;
  }
  
  .button-row {
    flex-direction: column;
  }
  
  .preview-list {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style> 