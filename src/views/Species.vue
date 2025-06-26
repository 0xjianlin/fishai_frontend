<template>
  <div class="species-view">
    <h1 class="mb-4">Species Guide</h1>
    
    <b-row>
      <b-col md="4" class="mb-4">
        <b-form-group label="Search Species">
          <b-form-input
            v-model="searchQuery"
            placeholder="Search by name..."
            @input="filterSpecies"
          ></b-form-input>
        </b-form-group>
      </b-col>
    </b-row>
    
    <b-row>
      <b-col
        v-for="species in filteredSpecies"
        :key="species.id"
        md="4"
        class="mb-4"
      >
        <b-card
          class="h-100 species-card"
          :to="{ name: 'SpeciesDetail', params: { id: species.id }}"
        >
          <template #header>
            <img
              v-if="species.image_url"
              :src="species.image_url"
              class="img-fluid rounded"
              :alt="species.name"
            >
            <div v-else class="placeholder-image">
              <i class="fas fa-fish fa-3x"></i>
            </div>
          </template>
          
          <h5>{{ species.name }}</h5>
          <p class="text-muted mb-2">
            <em>{{ species.scientific_name }}</em>
          </p>
          
          <div v-if="species.regulations" class="regulations-preview">
            <small>
              <strong>Size Limit:</strong>
              {{ species.regulations.min_size ? `${species.regulations.min_size} inches` : 'None' }}
            </small>
            <br>
            <small>
              <strong>Bag Limit:</strong>
              {{ species.regulations.bag_limit || 'None' }}
            </small>
          </div>
          
          <template #footer>
            <b-button
              variant="outline-primary"
              block
              :to="{ name: 'SpeciesDetail', params: { id: species.id }}"
            >
              View Details
            </b-button>
          </template>
        </b-card>
      </b-col>
    </b-row>
    
    <b-alert
      v-if="error"
      show
      variant="danger"
      dismissible
      @dismissed="clearError"
    >
      {{ error }}
    </b-alert>
    
    <b-alert
      v-if="!loading && filteredSpecies.length === 0"
      show
      variant="info"
    >
      No species found matching your search.
    </b-alert>
    
    <div v-if="loading" class="text-center my-5">
      <b-spinner variant="primary"></b-spinner>
      <p class="mt-2">Loading species...</p>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'SpeciesView',
  
  data() {
    return {
      searchQuery: '',
      filteredSpecies: []
    }
  },
  
  computed: {
    ...mapState(['species', 'loading']),
    ...mapGetters(['error'])
  },
  
  methods: {
    ...mapActions(['fetchSpecies']),
    
    filterSpecies() {
      if (!this.searchQuery) {
        this.filteredSpecies = this.species
        return
      }
      
      const query = this.searchQuery.toLowerCase()
      this.filteredSpecies = this.species.filter(species => 
        species.name.toLowerCase().includes(query) ||
        species.scientific_name.toLowerCase().includes(query)
      )
    },
    
    clearError() {
      this.$store.commit('SET_ERROR', null)
    }
  },
  
  async created() {
    await this.fetchSpecies()
    this.filteredSpecies = this.species
  },
  
  // watch: {
  //   species: {
  //     handler(newSpecies) {
  //       this.filterSpecies()
  //     },
  //     immediate: true
  //   }
  // }
}
</script>

<style lang="scss" scoped>
.species-view {
  .species-card {
    transition: transform 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
    }
    
    .card-header {
      padding: 0;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 200px;
        object-fit: cover;
      }
    }
    
    .placeholder-image {
      height: 200px;
      background-color: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #dee2e6;
    }
  }
  
  .regulations-preview {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #dee2e6;
  }
}
</style> 