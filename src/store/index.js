import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:8000/api'

export default new Vuex.Store({
  state: {
    predictions: [],
    species: [],
    loading: false,
    error: null
  },
  
  mutations: {
    SET_PREDICTIONS(state, predictions) {
      state.predictions = predictions
    },
    SET_SPECIES(state, species) {
      state.species = species
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  
  actions: {
    async identifyFish({ commit }, imageFile) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const formData = new FormData()
        formData.append('file', imageFile)
        
        const response = await axios.post(`${API_URL}/identify`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        commit('SET_PREDICTIONS', response.data)
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.detail || 'Error identifying fish')
        commit('SET_PREDICTIONS', [])
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchSpecies({ commit }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await axios.get(`${API_URL}/species`)
        commit('SET_SPECIES', response.data)
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.detail || 'Error fetching species')
        commit('SET_SPECIES', [])
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchSpeciesDetail({ commit }, speciesId) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await axios.get(`${API_URL}/species/${speciesId}`)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.detail || 'Error fetching species details')
        return null
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },
  
  getters: {
    topPrediction: state => state.predictions[0] || null,
    hasPredictions: state => state.predictions.length > 0,
    isLoading: state => state.loading,
    error: state => state.error
  }
}) 