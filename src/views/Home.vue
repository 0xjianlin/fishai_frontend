<template>
  <div class="home-view">
    <b-jumbotron
      header="Fishing-AI"
      lead="Identify California saltwater fish species and access fishing regulations instantly"
    >
      <p>
        Upload a photo of your catch and get instant species identification
        along with current fishing regulations.
      </p>
      
      <b-button
        variant="primary"
        size="lg"
        to="/identify"
        class="mr-2"
      >
        Identify Fish
      </b-button>
      
      <b-button
        variant="outline-primary"
        size="lg"
        to="/species"
      >
        Browse Species
      </b-button>
    </b-jumbotron>
    
    <b-row class="mt-5">
      <b-col md="4" class="mb-4">
        <b-card class="h-100 species-card">
          <template #header>
            <i class="fas fa-camera fa-2x text-primary"></i>
          </template>
          
          <h5>Instant Identification</h5>
          <p class="text-muted">
            Upload a photo of your catch and get instant species identification
            with confidence scores.
          </p>
        </b-card>
      </b-col>
      
      <b-col md="4" class="mb-4">
        <b-card class="h-100 species-card">
          <template #header>
            <i class="fas fa-book fa-2x text-primary"></i>
          </template>
          
          <h5>Regulation Lookup</h5>
          <p class="text-muted">
            Access current California saltwater fishing regulations including
            size limits, bag limits, and seasonal restrictions.
          </p>
        </b-card>
      </b-col>
      
      <b-col md="4" class="mb-4">
        <b-card class="h-100 species-card">
          <template #header>
            <i class="fas fa-fish fa-2x text-primary"></i>
          </template>
          
          <h5>Species Guide</h5>
          <p class="text-muted">
            Browse our comprehensive guide of California saltwater fish species
            with detailed information and images.
          </p>
        </b-card>
      </b-col>
    </b-row>
    
    <b-row class="mt-4">
      <b-col md="8" offset-md="2">
        <b-card class="text-center">
          <h4>How It Works</h4>
          
          <b-row class="mt-4">
            <b-col md="4">
              <div class="step">
                <div class="step-number">1</div>
                <h6>Take a Photo</h6>
                <p class="text-muted">
                  Capture a clear photo of your catch
                </p>
              </div>
            </b-col>
            
            <b-col md="4">
              <div class="step">
                <div class="step-number">2</div>
                <h6>Upload</h6>
                <p class="text-muted">
                  Upload the photo to our system
                </p>
              </div>
            </b-col>
            
            <b-col md="4">
              <div class="step">
                <div class="step-number">3</div>
                <h6>Get Results</h6>
                <p class="text-muted">
                  Receive species identification and regulations
                </p>
              </div>
            </b-col>
          </b-row>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style lang="scss" scoped>
.home-view {
  .jumbotron {
    background-color: #f8f9fa;
    border-radius: 0.5rem;
  }
  
  .step {
    position: relative;
    padding: 1rem;
    
    .step-number {
      width: 40px;
      height: 40px;
      background-color: #007bff;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
      margin: 0 auto 1rem;
    }
  }
  
  .species-card {
    text-align: center;
    
    .card-header {
      background: none;
      border: none;
      padding-bottom: 0;
    }
  }
}
</style> 