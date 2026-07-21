echo "🔧 Fixing build issues..."

cd android && ./gradlew clean 
 
 echo "✅ Gradle cleaned"

./gradlew assembleDebug

echo "✅ Build completed"



