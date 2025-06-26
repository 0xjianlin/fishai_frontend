<template>
  <div class="species-detail">
    <b-button variant="outline-primary" class="mb-4" @click="$router.push('/species')">
      <i class="fas fa-arrow-left mr-2"></i> Back to Species
    </b-button>
    
    <div v-if="loading" class="text-center my-5">
      <b-spinner variant="primary"></b-spinner>
      <p class="mt-2">Loading species details...</p>
    </div>
    
    <template v-else-if="species">
      <b-row>
        <b-col md="6" class="mb-4">
          <b-card>
            <template #header>
              <img v-if="species.image_url" :src="species.image_url" class="img-fluid rounded" :alt="species.name">
              <div v-else class="placeholder-image"><i class="fas fa-fish fa-5x"></i></div>
            </template>
            <h2>{{ species.name }}</h2>
            <p class="text-muted"><em>{{ species.scientific_name }}</em></p>
            <div v-if="species.description" class="mt-4">
              <h5>Description</h5>
              <p>{{ species.description }}</p>
            </div>
            <div v-if="species.habitat" class="mt-4">
              <h5>Habitat</h5>
              <p>{{ species.habitat }}</p>
            </div>
            <div v-if="species.average_size || species.record_size" class="mt-4">
              <h5>Size Information</h5>
              <ul class="list-unstyled">
                <li v-if="species.average_size"><strong>Average Size:</strong> {{ species.average_size }} inches</li>
                <li v-if="species.record_size"><strong>Record Size:</strong> {{ species.record_size }} inches</li>
              </ul>
            </div>
          </b-card>
        </b-col>
        
        <b-col md="6">
          <b-card>
            <template #header><h5 class="mb-0">Fishing Regulations</h5></template>
            <div v-if="species.regulations">
              <b-list-group flush>
                <b-list-group-item v-if="species.regulations.min_size">
                  <strong>Minimum Size:</strong> {{ species.regulations.min_size }} inches
                </b-list-group-item>
                <b-list-group-item v-if="species.regulations.max_size">
                  <strong>Maximum Size:</strong> {{ species.regulations.max_size }} inches
                </b-list-group-item>
                <b-list-group-item v-if="species.regulations.bag_limit">
                  <strong>Bag Limit:</strong> {{ species.regulations.bag_limit }}
                </b-list-group-item>
                <b-list-group-item v-if="species.regulations.season_start">
                  <strong>Season:</strong> {{ species.regulations.season_start }} to {{ species.regulations.season_end }}
                </b-list-group-item>
                <b-list-group-item v-if="species.regulations.gear_restrictions?.length">
                  <strong>Gear Restrictions:</strong>
                  <ul class="mb-0 mt-2">
                    <li v-for="restriction in species.regulations.gear_restrictions" :key="restriction">{{ restriction }}</li>
                  </ul>
                </b-list-group-item>
                <b-list-group-item v-if="species.regulations.special_restrictions?.length">
                  <strong>Special Restrictions:</strong>
                  <ul class="mb-0 mt-2">
                    <li v-for="restriction in species.regulations.special_restrictions" :key="restriction">{{ restriction }}</li>
                  </ul>
                </b-list-group-item>
                <b-list-group-item v-if="species.regulations.notes">
                  <strong>Notes:</strong>
                  <p class="mb-0 mt-2">{{ species.regulations.notes }}</p>
                </b-list-group-item>
              </b-list-group>
            </div>
            <div v-else class="text-center py-4">
              <p class="text-muted mb-0">No regulation information available</p>
            </div>
          </b-card>
          
          <b-card class="mt-4">
            <template #header><h5 class="mb-0">Identify This Species</h5></template>
            <p>Upload a photo to identify this species and verify regulations.</p>
            <b-button variant="primary" block to="/identify">Go to Identification</b-button>
          </b-card>
        </b-col>
      </b-row>
    </template>
    
    <b-alert v-if="error" show variant="danger" dismissible @dismissed="clearError">{{ error }}</b-alert>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'

export default {
  name: 'SpeciesDetailView',
  props: { id: { type: String, required: true } },
  data() { return { species: null } },
  computed: { ...mapGetters(['error']), ...mapState(['loading']) },
  methods: {
    ...mapActions(['fetchSpeciesDetail']),
    clearError() { this.$store.commit('SET_ERROR', null) }
  },
  async created() { this.species = await this.fetchSpeciesDetail(this.id) }
}
</script>

<style lang="scss" scoped>
.species-detail {
  .placeholder-image {
    height: 300px; background-color: #f8f9fa; display: flex; align-items: center; justify-content: center; color: #dee2e6; border-radius: 0.25rem;
  }
  .card-header {
    padding: 0; overflow: hidden;
    img { width: 100%; height: 300px; object-fit: cover; }
  }
}
</style> 