import { api } from "./api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  Training,
  TrainingType,
  Trainer,
  CreateTrainingDto,
  CreateTrainingTypeDto,
  CreateTrainerDto,
} from "@/types/training";

export const trainingService = {
  // Trainings
  getTrainings: async (): Promise<Training[]> => {
    const response = await api.get<{ data: Training[] }>(API_ENDPOINTS.trainings.list);
    return response.data.data;
  },

  getTraining: async (id: string): Promise<Training> => {
    const response = await api.get<{ data: Training }>(API_ENDPOINTS.trainings.detail(id));
    return response.data.data;
  },

  createTraining: async (data: CreateTrainingDto): Promise<Training> => {
    const response = await api.post<{ data: Training }>(API_ENDPOINTS.trainings.create, data);
    return response.data.data;
  },

  updateTraining: async (id: string, data: Partial<CreateTrainingDto>): Promise<Training> => {
    const response = await api.put<{ data: Training }>(API_ENDPOINTS.trainings.update(id), data);
    return response.data.data;
  },

  deleteTraining: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.trainings.delete(id));
  },

  // Training Types
  getTrainingTypes: async (): Promise<TrainingType[]> => {
    const response = await api.get<{ data: TrainingType[] }>(API_ENDPOINTS.trainingTypes.list);
    return response.data.data;
  },

  getTrainingType: async (id: string): Promise<TrainingType> => {
    const response = await api.get<{ data: TrainingType }>(API_ENDPOINTS.trainingTypes.detail(id));
    return response.data.data;
  },

  createTrainingType: async (data: CreateTrainingTypeDto): Promise<TrainingType> => {
    const response = await api.post<{ data: TrainingType }>(API_ENDPOINTS.trainingTypes.create, data);
    return response.data.data;
  },

  updateTrainingType: async (id: string, data: Partial<CreateTrainingTypeDto>): Promise<TrainingType> => {
    const response = await api.put<{ data: TrainingType }>(API_ENDPOINTS.trainingTypes.update(id), data);
    return response.data.data;
  },

  deleteTrainingType: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.trainingTypes.delete(id));
  },

  // Trainers
  getTrainers: async (): Promise<Trainer[]> => {
    const response = await api.get<{ data: Trainer[] }>(API_ENDPOINTS.trainers.list);
    return response.data.data;
  },

  getTrainer: async (id: string): Promise<Trainer> => {
    const response = await api.get<{ data: Trainer }>(API_ENDPOINTS.trainers.detail(id));
    return response.data.data;
  },

  createTrainer: async (data: CreateTrainerDto): Promise<Trainer> => {
    const response = await api.post<{ data: Trainer }>(API_ENDPOINTS.trainers.create, data);
    return response.data.data;
  },

  updateTrainer: async (id: string, data: Partial<CreateTrainerDto>): Promise<Trainer> => {
    const response = await api.put<{ data: Trainer }>(API_ENDPOINTS.trainers.update(id), data);
    return response.data.data;
  },

  deleteTrainer: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.trainers.delete(id));
  },
};
