<template>
  <div class="identify-view">
    <h1 class="mb-4">Identify Fish</h1>
    
    <b-row>
      <b-col md="6" class="mb-4">
        <b-card>
          <template #header>
            <h5 class="mb-0">Upload Fish Image</h5>
          </template>
          
          <div
            class="upload-area"
            @dragover.prevent
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="d-none"
              @change="handleFileSelect"
            >
            
            <template v-if="!previewImage">
              <i class="fas fa-cloud-upload-alt fa-3x mb-3"></i>
              <p class="mb-0">
                Drag and drop an image here, or click to select
              </p>
            </template>
            
            <img
              v-else
              :src="previewImage"
              class="img-fluid rounded"
              alt="Preview"
            >
          </div>
          
          <template #footer>
            <b-button
              variant="primary"
              :disabled="!selectedFile || loading"
              @click="identifyFish"
            >
              <b-spinner small v-if="loading"></b-spinner>
              {{ loading ? 'Identifying...' : 'Identify Fish' }}
            </b-button>
          </template>
        </b-card>
      </b-col>
      
      <b-col md="6">
        <b-card v-if="hasPredictions">
          <template #header>
            <h5 class="mb-0">Identification Results</h5>
          </template>
          
          <div v-for="prediction in predictions" :key="prediction.species_id" class="mb-4">
            <h6>{{ prediction.species_info.name }}</h6>
            <div class="confidence-bar">
              <div
                class="confidence-fill"
                :style="{ width: `${prediction.confidence * 100}%` }"
              ></div>
            </div>
            <small class="text-muted">
              {{ (prediction.confidence * 100).toFixed(1) }}% confidence
            </small>
            
            <b-card class="mt-2" no-body>
              <b-card-body>
                <h6>Regulations</h6>
                <ul class="list-unstyled mb-0">
                  <li v-if="prediction.species_info.regulations.min_size">
                    <strong>Minimum Size:</strong> {{ prediction.species_info.regulations.min_size }} inches
                  </li>
                  <li v-if="prediction.species_info.regulations.bag_limit">
                    <strong>Bag Limit:</strong> {{ prediction.species_info.regulations.bag_limit }}
                  </li>
                  <li v-if="prediction.species_info.regulations.season_start">
                    <strong>Season:</strong>
                    {{ prediction.species_info.regulations.season_start }} to
                    {{ prediction.species_info.regulations.season_end }}
                  </li>
                </ul>
              </b-card-body>
            </b-card>
          </div>
        </b-card>
        
        <b-alert
          v-if="error"
          show
          variant="danger"
          dismissible
          @dismissed="clearError"
        >
          {{ error }}
        </b-alert>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'IdentifyView',
  
  data() {
    return {
      selectedFile: null,
      previewImage: null
    }
  },
  
  computed: {
    ...mapState(['predictions', 'loading']),
    ...mapGetters(['hasPredictions', 'error'])
  },
  
  methods: {
    ...mapActions(['identifyFish']),
    
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) {
        this.processFile(file)
      }
    },
    
    handleDrop(event) {
      const file = event.dataTransfer.files[0]
      if (file) {
        this.processFile(file)
      }
    },
    
    processFile(file) {
      if (!file.type.startsWith('image/')) {
        this.$bvToast.toast('Please select an image file', {
          title: 'Invalid File',
          variant: 'danger'
        })
        return
      }
      
      this.selectedFile = file
      this.previewImage = URL.createObjectURL(file)
    },
    
    async identifyFish() {
      if (!this.selectedFile) return
      
      await this.identifyFish(this.selectedFile)
    },
    
    clearError() {
      this.$store.commit('SET_ERROR', null)
    }
  },
  
  beforeUnmount() {
    if (this.previewImage) {
      URL.revokeObjectURL(this.previewImage)
    }
  }
}
</script>

<style lang="scss" scoped>
.identify-view {
  .upload-area {
    min-height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    img {
      max-height: 300px;
      object-fit: contain;
    }
  }
  
  .confidence-bar {
    margin: 0.5rem 0;
  }
}
</style> 