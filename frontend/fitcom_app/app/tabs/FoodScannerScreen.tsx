import { CameraView, CameraType, useCameraPermissions, FlashMode } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { processApiResponse } from '../process_data.js'
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';


export default function CameraScreen() {

  const [facing, setFacing] = useState<CameraType>('back');
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef(null);
  const [apiResponseData, setApiResponseData] = useState<any>(undefined);

  const [loading, setLoading] = useState(false);
  const [galleryPermission, requestGalleryPermission] = ImagePicker.useCameraPermissions();

  if (!permission || !galleryPermission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  if (!galleryPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to access the gallery</Text>
        <Button onPress={requestGalleryPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  function toggleFlash() {
    setFlashMode((current) => (current === 'off' ? 'on' : 'off'));
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await (cameraRef.current as any).takePictureAsync({
          flash: flashMode === 'on',
        });

        if (photo && photo.uri) {
          setPhotoUri(photo.uri);
        } else {
          console.error('Failed to take picture or URI is missing');
        }
      } catch (error) {
        console.error('Error taking picture:', error);
      }
    } else {
      console.error('Camera reference is null');
    }
  };

  const selectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting an image:', error);
    }
  };

  const retakePicture = () => {
    setPhotoUri(null);
    setApiResponseData(undefined);
  };

  const submitPicture = async () => {
    if (photoUri) {
        try {
            setLoading(true);

            // Resize image
            const manipResult = await manipulateAsync(
                photoUri,
                [{ resize: { width: 400 } }],
                { compress: 0.5, format: SaveFormat.PNG }
            );

            // Wrapping data in FormData
            const formData = new FormData();
            formData.append('image', {
                uri: manipResult.uri,
                name: 'photo.jpg',
                type: 'image/jpeg',
            } as any);

            // API request
            const apiResponse = await fetch('https://vision.foodvisor.io/api/1.0/en/analysis/', {
                method: 'POST',
                headers: {
                    'Authorization': 'Api-Key 0ZQV90h7.E86RhrbYY4JbgzboGay4yQDeU70eqbPF',
                },
                body: formData,
            });

            // Processing the data
            const responseText = await apiResponse.json();
            const processedData = processApiResponse(responseText);

            if (!processedData) {

                setApiResponseData(null);
            } else {
                // If food detected
                setApiResponseData({
                    ...processedData,
                    photoUri,
                });
            }

            setPhotoUri(null)
            setLoading(false);
        } catch (error) {
            console.error('Error submitting picture:', error);
            alert('An error occurred while processing the image. Please try again.');
            setLoading(false);
        }
    }
};





  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Image is being processed...</Text>
      </View>
    );
  }

  const RenderError = ({ onBack }: any) => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Food is not detected</Text>
      <TouchableOpacity style={styles.errorButton} onPress={onBack}>
        <Text style={styles.errorButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );


  const RenderPreview = ({ photoUri, onRetake, onSubmit }: any) => (
    <View style={styles.previewContainer}>
      <Image source={{ uri: photoUri }} style={styles.preview} />
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.previewButton} onPress={onRetake}>
          <Text style={styles.previewButtonText}>Retake</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.previewButton} onPress={onSubmit}>
          <Text style={styles.previewButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  const RenderResponse = ({ data, onBack }: any) => (
    <ScrollView style={styles.responseContainer} contentContainerStyle={styles.responseContent}>
      <View style={styles.dataBox}>
        <Image source={{ uri: data.photoUri }} style={styles.itemImage} />
        <Text style={styles.dataText}>Name: {data.display_name}</Text>
        <Text style={styles.dataText}>Serving Size: {data.g_per_serving}g</Text>
        <Text style={styles.dataText}>Ingredients: {Array.isArray(data.ingredients) ? data.ingredients.join(', ') : data.ingredients}</Text>
        <Text style={styles.dataText}>Calories: {data.nutrition?.calories ?? 'N/A'} kcal</Text>
        <Text style={styles.dataText}>Carbs: {data.nutrition?.carbs ?? 'N/A'}g</Text>
        <Text style={styles.dataText}>Fat: {data.nutrition?.fat ?? 'N/A'}g</Text>
        <Text style={styles.dataText}>Protein: {data.nutrition?.protein ?? 'N/A'}g</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.saveButton} onPress={() => console.log('Save logic goes here')}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const RenderCamera = ({
    cameraRef,
    facing,
    flashMode,
    onToggleFacing,
    onToggleFlash,
    onTakePicture,
    onSelectImage,
  }: any) => (
    <CameraView
      ref={cameraRef}
      style={styles.camera}
      facing={facing}
      flash={flashMode}
      mirror={true}
    >
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={onToggleFacing}>
          <Ionicons name="camera-reverse" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, flashMode === 'on' && styles.flashOnButton]}
          onPress={onToggleFlash}
        >
          <MaterialIcons
            name={flashMode === 'off' ? 'flash-off' : 'flash-on'}
            size={24}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onTakePicture}>
          <Ionicons name="camera" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onSelectImage}>
          <Ionicons name="image" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </CameraView>
  );


  return (
    <View style={styles.container}>
      {loading ? (

        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Image is being processed...</Text>
        </View>
      ) : apiResponseData === null ? (

        <RenderError onBack={retakePicture} />
      ) : apiResponseData ? (

        <RenderResponse data={apiResponseData} onBack={retakePicture} />
      ) : photoUri ? (

        <RenderPreview
          photoUri={photoUri}
          onRetake={retakePicture}
          onSubmit={submitPicture}
        />
      ) : (

        <RenderCamera
          cameraRef={cameraRef}
          facing={facing}
          flashMode={flashMode}
          onToggleFacing={toggleCameraFacing}
          onToggleFlash={toggleFlash}
          onTakePicture={takePicture}
          onSelectImage={selectImage}
        />
      )}
    </View>
  );



}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  button: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  flashOnButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: '80%',
  },
  responseContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',

  },
  responseContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
  },
  dataBox: {
    backgroundColor: 'lightgray',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  dataText: {
    fontSize: 16,
    color: 'black',
    marginBottom: 5,
  },
  overlay: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  previewButton: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'grey',
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },itemImage: {

    width: '100%',
    height: 'auto',
    aspectRatio: 16 / 9,
    borderRadius: 10,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  saveButton: {
    flex: 1,
    marginRight: 5,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', },

  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    flex: 1,
    marginLeft: 5,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'red',
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },

});
