'use client';

import { useState, useEffect, useCallback } from 'react';
import { accountService, imageService } from '@/services';
import type { Account } from '@/services';
import { ImageDisplay } from '@/components/ui/image-display';
import { ImagePreview } from '@/components/ui/image-preview';

interface GenerationRequest {
  prompt: string;
  negative_prompt: string;
  width: number;
  height: number;
  steps: number;
  denoising_strength: number;
  cfg_scale: number;
  sampler_index: number;
  accountId: number;
  baseImageId?: number;
  description?: string;
  isStory: boolean;
  type: string;
}

export default function GeneratePage() {
  const [mode, setMode] = useState<'base' | 'profile'>('base');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [selectedAccountData, setSelectedAccountData] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAccounts, setLoadingAccounts] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<any>(null);

  // Nouveaux états pour le prompt de base
  const [basePrompt, setBasePrompt] = useState('');
  const [isBasePromptEditable, setIsBasePromptEditable] = useState(false);

  const [params, setParams] = useState({
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

  // Charger les comptes
  useEffect(() => {
    const loadAccounts = async () => {
      setLoadingAccounts(true);
      try {
        const accountsData = await accountService.getAccounts();
        setAccounts(accountsData);
      } catch (error) {
        console.error('Erreur lors du chargement des comptes:', error);
      } finally {
        setLoadingAccounts(false);
      }
    };

    loadAccounts();
  }, []);

  // Charger les données du compte sélectionné
  useEffect(() => {
    const loadAccountData = async () => {
      if (selectedAccount) {
        try {
          // Charger les données du compte complet depuis l'API
          const accountData = await accountService.getAccount(selectedAccount);
          setSelectedAccountData(accountData);
          
          // Mettre à jour le prompt de base avec le prompt de l'image principale
          if (accountData.mainImage?.prompt) {
            setBasePrompt(accountData.mainImage.prompt);
          } else {
            setBasePrompt('');
          }
          
          // Réinitialiser l'état d'édition
          setIsBasePromptEditable(false);
          
        } catch (error) {
          console.error('Erreur lors du chargement du compte:', error);
          setSelectedAccountData(null);
          setBasePrompt('');
        }
      } else {
        setSelectedAccountData(null);
        setBasePrompt('');
        setIsBasePromptEditable(false);
      }
    };

    loadAccountData();
  }, [selectedAccount]);

  const handleParamChange = (key: string, value: string | number) => {
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

    if (mode === 'profile' && !selectedAccountData?.mainImage?.id) {
      alert('Ce compte n\'a pas d\'image principale. Veuillez d\'abord définir une image principale pour ce compte.');
      return;
    }

    setIsLoading(true);
    setGeneratedImage(null);

    try {
      let result;

      if (mode === 'base') {
        const generateData: GenerationRequest = {
          ...params,
          accountId: selectedAccount,
          description: formData.description,
          isStory: formData.isStory,
          type: 'base',
        };

        result = await imageService.generateBaseImage(generateData);
      } else {
        // Assurer que baseImageId existe avant de l'utiliser
        const baseImageId = selectedAccountData!.mainImage!.id;
        
        // Concaténer le prompt de base et le prompt avec une virgule
        let finalPrompt = params.prompt;
        if (basePrompt.trim() && params.prompt.trim()) {
          finalPrompt = `${basePrompt.trim()}, ${params.prompt.trim()}`;
        } else if (basePrompt.trim()) {
          finalPrompt = basePrompt.trim();
        }
        
        const generateData = {
          ...params,
          prompt: finalPrompt, // Utiliser le prompt concaténé
          accountId: selectedAccount,
          baseImageId,
          description: formData.description,
          isStory: formData.isStory,
          type: 'normal',
        };

        result = await imageService.generateImageFromBase(generateData);
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
    if (!generatedImage || !selectedAccount) return;

    try {
      if (mode === 'base') {
        // Mode "Image de Base" : définir comme image principale du compte
        await accountService.setMainImage(selectedAccount, generatedImage.id);
        alert('Image sauvegardée et définie comme image principale avec succès !');
      } else {
        // Mode "Photo à partir d'un Profil" : marquer comme sauvegardée
        await imageService.markAsSaved(generatedImage.id);
        alert('Photo sauvegardée avec succès !');
      }
      
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
      setFormData(prev => ({ ...prev, description: '' }));
      
      // Recharger les données du compte seulement en mode 'base'
      if (mode === 'base' && selectedAccount) {
        try {
          const accountData = await accountService.getAccount(selectedAccount);
          setSelectedAccountData(accountData);
          
          if (accountData.mainImage?.prompt) {
            setBasePrompt(accountData.mainImage.prompt);
          }
        } catch (error) {
          console.error('Erreur lors du rechargement du compte:', error);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de l\'image');
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
                    {account.name}
                  </option>
                ))}
              </select>
              {accounts.length === 0 && !isLoadingAccounts && (
                <p className="text-sm text-red-600 mt-1">
                  Aucun compte trouvé. Veuillez d'abord ajouter un compte Instagram.
                </p>
              )}
            </div>

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

            {/* Base Prompt - Affiché seulement en mode profile */}
            {mode === 'profile' && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Prompt de Base
                  </label>
                  <button
                    onClick={() => setIsBasePromptEditable(!isBasePromptEditable)}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {isBasePromptEditable ? 'Protéger' : 'Modifier le prompt de base'}
                  </button>
                </div>
                <textarea
                  value={basePrompt}
                  onChange={(e) => setBasePrompt(e.target.value)}
                  disabled={!isBasePromptEditable}
                  placeholder="Prompt de l'image de base..."
                  rows={2}
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isBasePromptEditable ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
                {basePrompt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Ce prompt sera automatiquement ajouté avant votre prompt personnalisé
                  </p>
                )}
              </div>
            )}

            {/* Prompt */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {mode === 'profile' ? 'Prompt Personnalisé *' : 'Prompt *'}
              </label>
              <textarea
                value={params.prompt}
                onChange={(e) => handleParamChange('prompt', e.target.value)}
                placeholder={
                  mode === 'profile' 
                    ? "Ajoutez des éléments spécifiques à votre génération..."
                    : "Décrivez l'image que vous souhaitez générer..."
                }
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {mode === 'profile' && basePrompt && params.prompt && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-xs text-blue-800 font-medium mb-1">Prompt final qui sera utilisé :</p>
                  <p className="text-xs text-blue-700">
                    "{basePrompt.trim()}, {params.prompt.trim()}"
                  </p>
                </div>
              )}
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
              disabled={
                isLoading || 
                !selectedAccount || 
                (!params.prompt && mode === 'base') ||
                (mode === 'profile' && !basePrompt && !params.prompt) ||
                (mode === 'profile' && !selectedAccountData?.mainImage?.id)
              }
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                isLoading || 
                !selectedAccount || 
                (!params.prompt && mode === 'base') ||
                (mode === 'profile' && !basePrompt && !params.prompt) ||
                (mode === 'profile' && !selectedAccountData?.mainImage?.id)
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
          {/* Base Image Preview - Affiché pour les deux modes */}
          {selectedAccount && (
            <ImagePreview
              imageId={selectedAccountData?.mainImage?.id}
              title={mode === 'profile' ? 'Image Principale du Compte' : 'Image de Base'}
              isLoading={false}
              imageData={selectedAccountData?.mainImage}
            />
          )}

          {/* Generated Image Preview */}
          <ImagePreview
            imageId={generatedImage?.id}
            title="Image Générée"
            isLoading={isLoading}
            imageData={generatedImage}
            showDetails={false}
          >
            {generatedImage && (
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={handleSavePhoto}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {mode === 'base' ? 'Sauvegarder comme Image Principale' : 'Sauvegarder'}
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!selectedAccount || (!params.prompt && mode === 'base') || (mode === 'profile' && !basePrompt && !params.prompt)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Régénérer
                </button>
              </div>
            )}
          </ImagePreview>

          {isLoading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Génération en cours...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}