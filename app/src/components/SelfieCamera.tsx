import { Ionicons } from "@expo/vector-icons"
import { CameraView, useCameraPermissions } from "expo-camera"
import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export type SelfiePhoto = { uri: string; base64: string; mime: string }

type Props = {
  visible: boolean
  onCancel: () => void
  onCapture: (photo: SelfiePhoto) => void
}

/**
 * Өөрийн бэлдсэн урд камерын дэлгэц. Систем камер сонгогч
 * (ImagePicker.launchCameraAsync) ашиглахгүй байгаа шалтгаан нь: тэр
 * amьd харагдацыг толин шиг эргүүлдэг ч эцсийн зургаа буцаагаад "жинхэнэ"
 * (эргээгүй) чиглэлээр хадгалдаг тул хэрэглэгчид "зураг эргэчихлээ" гэж
 * харагддаг. Энд `mirror` prop-оор урьдчилан харах ба авсан зураг ХОЁУЛАА
 * ижил (толин) чиглэлтэй байлгана.
 */
export function SelfieCamera({ visible, onCancel, onCapture }: Props) {
  const [permission, requestPermission] = useCameraPermissions()
  const [capturing, setCapturing] = useState(false)
  const cameraRef = useRef<CameraView>(null)

  useEffect(() => {
    if (visible && !permission?.granted) {
      void requestPermission()
    }
  }, [visible, permission?.granted, requestPermission])

  async function onShutterPress() {
    if (capturing || !cameraRef.current) return
    setCapturing(true)
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.6,
      })
      if (photo?.base64) {
        onCapture({ uri: photo.uri, base64: photo.base64, mime: "image/jpeg" })
      }
    } finally {
      setCapturing(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      <View style={styles.container}>
        {permission?.granted ? (
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="front" mirror />
        ) : (
          <View style={styles.permissionBox}>
            <Text style={styles.permissionText}>
              {permission?.canAskAgain === false
                ? "Камерын зөвшөөрөл өгөөгүй байна. Тохиргооноос зөвшөөрнө үү."
                : "Камерын зөвшөөрөл хүлээж байна…"}
            </Text>
          </View>
        )}

        <SafeAreaView style={styles.overlay} pointerEvents="box-none">
          <Pressable style={styles.closeButton} onPress={onCancel} hitSlop={10}>
            <Ionicons name="close" size={26} color="#fff" />
          </Pressable>

          {permission?.granted && (
            <View style={styles.shutterRow}>
              <Pressable
                style={styles.shutterButton}
                onPress={() => void onShutterPress()}
                disabled={capturing}
                hitSlop={10}
              >
                {capturing ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <View style={styles.shutterInner} />
                )}
              </Pressable>
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  overlay: { flex: 1, justifyContent: "space-between" },
  closeButton: {
    alignSelf: "flex-start",
    margin: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterRow: { alignItems: "center", marginBottom: 32 },
  shutterButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.4)",
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#000",
  },
  permissionBox: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  permissionText: { color: "#fff", fontSize: 14, textAlign: "center", lineHeight: 20 },
})
