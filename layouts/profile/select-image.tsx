import { FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Divider } from '~/components/Divider';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { MediaTypeOptions, launchImageLibraryAsync } from 'expo-image-picker';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { Button } from '~/components/Button';

export const SelectImage = () => {
  const { user, addImageToUserAndSetCache } = useCurrentUserHook();
  const [uploading, setUploading] = useState<string>();

  const pickImage = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setUploading(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!uploading) return;
    try {
      const response = await fetch(uploading);
      const blob = await response.blob();
      const fileName = uploading.substring(uploading.lastIndexOf('/') + 1);
      const storage = getStorage();
      const mountainsRef = ref(storage, `images/${user?.uid}/${fileName}`);

      uploadBytes(mountainsRef, blob).then(async (snapshot) => {
        console.log('Uploaded a blob or file!', snapshot.ref.fullPath);
        await getDownloadURL(snapshot.ref).then((url) => {
          addImageToUserAndSetCache(url);
          setUploading(undefined);
        });
      });
    } catch (err) {
      console.log('err', err);
    }
  };

  return (
    <>
      {user?.image && (
        <TouchableOpacity className="w-full flex items-center justify-center" onPress={pickImage}>
          <Image
            source={{ uri: uploading ? uploading : user.image }}
            className="w-40 h-40 rounded-full"
            alt="user-image"
          />
        </TouchableOpacity>
      )}

      {!user?.image && (
        <View className="w-full flex items-center justify-center gap-2">
          {!uploading && (
            <>
              <TouchableOpacity
                onPress={pickImage}
                className="p-2 bg-zinc-200 rounded-full w-[130px] h-[130px] flex items-center justify-center">
                <FontAwesome name="user" size={100} color={'#5e5e5e'} />
              </TouchableOpacity>
              <Text className="text-center font-kanit text-lg">
                Clique no icone acima para adicionar uma imagem!!
              </Text>
            </>
          )}

          {uploading && (
            <>
              <Image
                source={{ uri: uploading }}
                className="p-2 bg-zinc-200 rounded-full w-[130px] h-[130px] flex items-center justify-center"
              />
            </>
          )}
        </View>
      )}

      {uploading && (
        <>
          <TouchableOpacity>
            <Button
              variant="default"
              onPress={async () => {
                await uploadImage();
              }}
              icon={{
                name: 'upload',
                color: 'white',
                size: 15,
              }}>
              Salvar imagem
            </Button>
          </TouchableOpacity>
        </>
      )}

      <Divider />
    </>
  );
};
