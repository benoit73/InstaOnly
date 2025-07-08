'use client';

import { useState, useEffect } from 'react';
import { photoService, accountService } from '@/services';
import type { Account } from '@/services';
import { ImageDisplay } from '@/components/ui/image-display'; // Ajout de l'import manquant

interface GenerationParams {
  prompt: string;
  negative_prompt: string;
  width: number;
  height: number;
  steps: number;
  denoising_strength: number;
  cfg_scale: number;
  sampler_index: number;
}

interface BaseImageGenerationRequest extends GenerationParams {
  accountId: number;
  description?: string;
  isStory: boolean;
}

interface ProfileImageGenerationRequest extends GenerationParams {
  accountId: number;
  baseImageId: string;
  description?: string;
  isStory: boolean;
}

export default function GeneratePage() {
  const [mode, setMode] = useState<'base' | 'profile'>('base');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [baseImages, setBaseImages] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [selectedBaseImage, setSelectedBaseImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<any>(null);

  const [params, setParams] = useState<GenerationParams>({
    prompt: '',
    negative_prompt: '',
    width: 512,
    height: 512,
    steps: 20,
    denoising_strength: 0.7,
    cfg_scale: 7.5,
    sampler_index: 0,
  });

  const [formData, setFormData] = useState({
    description: '',
    isStory: false,
  });

  const samplerOptions = [
    'Euler',
    'Euler a',
    'Heun',
    'DPM++ 2M',
    'DPM++ SDE',
    'DDIM',
    'PLMS',
  ];

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (mode === 'profile' && selectedAccount) {
      loadBaseImages();
    }
  }, [mode, selectedAccount]);

  const loadAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const accountsData = await accountService.getAccounts();
      setAccounts(accountsData);
    } catch (error) {
      console.error('Erreur lors du chargement des comptes:', error);
      alert('Erreur lors du chargement des comptes');
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const loadBaseImages = async () => {
    setIsLoadingImages(true);
    try {
      if (selectedAccount) {
        const images = await photoService.getPhotosByAccount(selectedAccount, 'published');
        setBaseImages(images);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des images de base:', error);
      alert('Erreur lors du chargement des images de base');
    } finally {
      setIsLoadingImages(false);
    }
  };

  const handleParamChange = (key: keyof GenerationParams, value: string | number) => {
    setParams(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleGenerate = async () => {
    if (!selectedAccount) {
      alert('Veuillez sélectionner un compte');
      return;
    }

    if (mode === 'profile' && !selectedBaseImage) {
      alert('Veuillez sélectionner une image de base');
      return;
    }

    setIsLoading(true);
    setGeneratedImage(null);

    try {
      let result;

      if (mode === 'base') {
        const generateData: BaseImageGenerationRequest = {
          ...params,
          accountId: selectedAccount,
          description: formData.description,
          isStory: formData.isStory,
        };

        result = await photoService.generateBaseImage(generateData);
      } else {
        const generateData: ProfileImageGenerationRequest = {
          ...params,
          accountId: selectedAccount,
          baseImageId: selectedBaseImage!,
          description: formData.description,
          isStory: formData.isStory,
        };

        result = await photoService.generateProfileImage(generateData);
      }

      setGeneratedImage(result);
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      alert('Erreur lors de la génération de l\'image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePhoto = async () => {
    if (!generatedImage) return;

    try {
      // L'image est déjà sauvegardée lors de la génération
      alert('Image sauvegardée avec succès !');
      setGeneratedImage(null);
      setParams({
        prompt: '',
        negative_prompt: '',
        width: 512,
        height: 512,
        steps: 20,
        denoising_strength: 0.7,
        cfg_scale: 7.5,
        sampler_index: 0,
      });
      setFormData({ description: '', isStory: false });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Générateur d'Images IA</h1>
        <p className="text-gray-600">Créez des images personnalisées avec l'intelligence artificielle</p>
      </div>

      {/* Mode Selection */}
      <div className="mb-8">
        <div className="flex space-x-4">
          <button
            onClick={() => setMode('base')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              mode === 'base'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Image de Base
          </button>
          <button
            onClick={() => setMode('profile')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              mode === 'profile'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Photo à partir d'un Profil
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Configuration</h2>

            {/* Account Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compte Instagram
              </label>
              <select
                value={selectedAccount || ''}
                onChange={(e) => setSelectedAccount(Number(e.target.value))}
                disabled={isLoadingAccounts}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {isLoadingAccounts ? 'Chargement des comptes...' : 'Sélectionner un compte'}
                </option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    @{account.username} {account.isConnected ? '✓' : '⚠️ Non connecté'}
                  </option>
                ))}
              </select>
              {accounts.length === 0 && !isLoadingAccounts && (
                <p className="text-sm text-red-600 mt-1">
                  Aucun compte trouvé. Veuillez d'abord ajouter un compte Instagram.
                </p>
              )}
            </div>

            {/* Base Image Selection (Profile Mode) */}
            {mode === 'profile' && selectedAccount && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image de Base
                </label>
                {isLoadingImages ? (
                  <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : baseImages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                    {baseImages.map((image) => (
                      <div
                        key={image.id}
                        onClick={() => setSelectedBaseImage(image.id)}
                        className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedBaseImage === image.id
                            ? 'border-blue-500'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image.image}
                          alt={image.description}
                          className="w-full h-20 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
                    Aucune image publiée trouvée pour ce compte. Publiez d'abord quelques images pour pouvoir les utiliser comme base.
                  </p>
                )}
              </div>
            )}

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description de l'image..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Story Toggle */}
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isStory}
                  onChange={(e) => setFormData(prev => ({ ...prev, isStory: e.target.checked }))}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Format Story</span>
              </label>
            </div>
          </div>

          {/* Advanced Parameters */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Paramètres Avancés</h3>

            {/* Prompt */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt *
              </label>
              <textarea
                value={params.prompt}
                onChange={(e) => handleParamChange('prompt', e.target.value)}
                placeholder="Décrivez l'image que vous souhaitez générer..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Negative Prompt */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt Négatif
              </label>
              <textarea
                value={params.negative_prompt}
                onChange={(e) => handleParamChange('negative_prompt', e.target.value)}
                placeholder="Éléments à éviter dans l'image..."
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Largeur
                </label>
                <input
                  type="number"
                  value={params.width}
                  onChange={(e) => handleParamChange('width', Number(e.target.value))}
                  min="256"
                  max="1024"
                  step="64"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hauteur
                </label>
                <input
                  type="number"
                  value={params.height}
                  onChange={(e) => handleParamChange('height', Number(e.target.value))}
                  min="256"
                  max="1024"
                  step="64"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Steps */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Steps: {params.steps}
              </label>
              <input
                type="range"
                value={params.steps}
                onChange={(e) => handleParamChange('steps', Number(e.target.value))}
                min="10"
                max="100"
                className="w-full"
              />
            </div>

            {/* Denoising Strength */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Denoising Strength: {params.denoising_strength}
              </label>
              <input
                type="range"
                value={params.denoising_strength}
                onChange={(e) => handleParamChange('denoising_strength', Number(e.target.value))}
                min="0.1"
                max="1.0"
                step="0.1"
                className="w-full"
              />
            </div>

            {/* CFG Scale */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CFG Scale: {params.cfg_scale}
              </label>
              <input
                type="range"
                value={params.cfg_scale}
                onChange={(e) => handleParamChange('cfg_scale', Number(e.target.value))}
                min="1"
                max="20"
                step="0.5"
                className="w-full"
              />
            </div>

            {/* Sampler */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sampler
              </label>
              <select
                value={params.sampler_index}
                onChange={(e) => handleParamChange('sampler_index', Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {samplerOptions.map((sampler, index) => (
                  <option key={index} value={index}>
                    {sampler}
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || !selectedAccount || !params.prompt}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                isLoading || !selectedAccount || !params.prompt
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Génération en cours...' : 'Générer l\'Image'}
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          {/* Base Image Preview (Profile Mode) */}
          {mode === 'profile' && selectedBaseImage && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Image de Base</h3>
              <div className="aspect-square rounded-lg overflow-hidden">
                {baseImages.find(img => img.id === selectedBaseImage) && (
                  <img
                    src={baseImages.find(img => img.id === selectedBaseImage)!.image}
                    alt="Image de base"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          )}

          {/* Generated Image Preview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Image Générée</h3>
            
            {isLoading ? (
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Génération en cours...</p>
                </div>
              </div>
            ) : generatedImage ? (
              <div>
                {/* Debug: Afficher la structure de l'image */}
                <details className="mb-4">
                  <summary className="text-xs text-gray-500 cursor-pointer">Debug - Structure de l'image</summary>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(generatedImage, null, 2)}
                  </pre>
                </details>
                
                <div className="aspect-square rounded-lg overflow-hidden mb-4">
                  <ImageDisplay
                    photo={generatedImage}
                    alt="Image générée"
                    className="w-full h-full object-cover"
                    width={512}
                    height={512}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleSavePhoto}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Sauvegarder
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={!selectedAccount || !params.prompt}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Régénérer
                  </button>
                </div>
              </div>
            ) : (
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">L'image générée apparaîtra ici</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}