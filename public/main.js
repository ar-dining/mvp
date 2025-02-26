import animations from './utils/animations.js'

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";

// import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBePMflFRC77poF1nXEz_MNZU_IYYxL-bc",
    authDomain: "ar-dining1.firebaseapp.com",
    projectId: "ar-dining1",
    storageBucket: "ar-dining1.firebasestorage.app",
    messagingSenderId: "739786209078",
    appId: "1:739786209078:web:4ab3317d1fbf8834cde597",
    measurementId: "G-B4XJ96BVPY"
};

const clientUrl = window.location.pathname
console.log("client Url: " + clientUrl)

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = firebase.firestore();
const storage = firebase.storage(); // Get Firebase Storage instance

let menuCategories = []

async function fetchAllClients() {
    console.log("Fetching  all clients...");
    try {

        const menuCollection = db.collection("menuDatabase");

        // Fetch all client documents
        const querySnapshot = await menuCollection.get();

        for (const doc of querySnapshot.docs) {
            console.log(`${doc.id} =>`, doc.data());

            // Fetch the foodItems subcollection
            const foodItemsCollection = doc.ref.collection("foodItems");
            const foodSnapshot = await foodItemsCollection.get();

            if (!foodSnapshot.empty) {
                for (const foodDoc of foodSnapshot.docs) {
                    const foodData = foodDoc.data();
                    console.log(`Food Item [${doc.id}] - ${foodDoc.id} =>`, foodData);

                    // Check if foodModel exists
                    if (foodData.foodModel) {
                        try {
                            // Convert gs:// URL to a download URL
                            const glbRef = storage.refFromURL(foodData.foodModel);
                            const glbDownloadUrl = await glbRef.getDownloadURL();
                            console.log(`GLB File URL for ${foodDoc.id}:`, glbDownloadUrl);
                        } catch (err) {
                            console.error(`Error fetching GLB URL for ${foodDoc.id}:`, err);
                        }
                    } else {
                        console.log(`No GLB file for ${foodDoc.id}`);
                    }
                }
            } else {
                console.log(`No food items found for client: ${doc.id}`);
            }
        }

        console.log("Fetch complete!");
    } catch (error) {
        console.error("Error fetching all clients:", error);
    }
}

async function fetchClient(clientUrl) {
    console.log("Fetching client with ID: " + clientUrl);

    try {


        // Get the client document using its ID
        const clientRef = db.collection("menuDatabase").doc(clientUrl);
        const clientSnap = await clientRef.get();

        if (!clientSnap.exists) {
            console.log("No client found with ID:", clientUrl);
            return;
        }

        console.log(`Client Found [${clientUrl}] =>`, clientSnap.data());

        // Fetch the Instagram link from the client document
        const instagramLink = clientSnap.data().instagram;
        if (instagramLink) {
            console.log("Instagram Link:", instagramLink);
            // Update the Instagram link in the UI dynamically
            document.getElementById("instagramLink").href = instagramLink;
        } else {
            console.log("No Instagram link found for this client.");
        }


        // Fetch the "foodItems" subcollection
        const foodItemsCollection = clientRef.collection("foodItems");
        const foodSnapshot = await foodItemsCollection.get();

        if (!foodSnapshot.empty) {
            foodSnapshot.forEach(async (foodDoc) => {
                const foodData = foodDoc.data();
                console.log(`Food Item [${foodDoc.id}] =>`, foodData);

                // Check if foodModel exists
                if (foodData.foodModel) {
                    try {
                        // Convert gs:// URL to a download URL
                        const glbRef = storage.refFromURL(foodData.foodModel);
                        const glbDownloadUrl = await glbRef.getDownloadURL();
                        console.log(`GLB File URL for ${foodDoc.id}:`, glbDownloadUrl);
                    } catch (err) {
                        console.error(`Error fetching GLB URL for ${foodDoc.id}:`, err);
                    }
                } else {
                    console.log(`No GLB file for ${foodDoc.id}`);
                }
            });
        } else {
            console.log(`No food items found for client: ${clientUrl}`);
        }

        console.log("Fetch complete!");
    } catch (error) {
        console.error("Error fetching client data:", error);
    }
}

async function getMenuCategories(clientUrl) {
    try {
        const db = firebase.firestore();

        // Get the client document using its ID
        const clientRef = db.collection("menuDatabase").doc(clientUrl);
        const clientSnap = await clientRef.get();

        if (!clientSnap.exists) {
            console.log("No client found with ID:", clientUrl);
            return [];
        }

        // Extract and return menu categories
        return clientSnap.data().menuCategories || [];

    } catch (error) {
        console.error("Error fetching menu categories:", error);
        return [];
    }
}

async function populateCategories(clientUrl) {
    try {
        const menuCategories = await getMenuCategories(clientUrl); // Fetch categories
        const categorySelect = document.getElementById("category");

        // Clear existing options
        categorySelect.innerHTML = "";

        // Populate select dropdown with categories
        menuCategories.forEach(category => {
            const option = document.createElement("option");
            console.log("option: ", option)
            option.value = category.toLowerCase().replace(/\s+/g, "-"); // Convert to lowercase with hyphens
            option.textContent = category; // Set display text
            categorySelect.appendChild(option);
        });

    } catch (error) {
        console.error("Error populating categories:", error);
    }
}





async function fetchFileUrl(filePath) {
    try {
        const storage = getStorage(); // Initialize Storage
        const fileRef = ref(storage, filePath); // Get reference to the file
        const url = await getDownloadURL(fileRef); // Get the download URL
        console.log("File URL:", url);
        return url;
    } catch (error) {
        console.error("Error fetching file URL:", error.message);
        return null;
    }
}




/****************************************
         *     1. Setup Scene, Camera, Renderer *
         ****************************************/
const canvas = document.getElementById("sceneCanvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.outputEncoding = THREE.sRGBEncoding;

let isRotating = true; // Controls whether the model rotates
let isMouseDown = false; // Tracks if the mouse is currently pressed
let debounceTimer = null; // Timer for debouncing mouse events


// Create scene
const scene = new THREE.Scene();
const n = 2;
const randomIndex = Math.floor(Math.random() * n) + 1;
let panoramaPath = "";




async function loadPanorama(clientUrl) {
    try {
        console.log(`\n--- Fetching panorama for client: ${clientUrl} ---`);

        // Reference to the client's document in Firestore
        const clientDocRef = db.collection("menuDatabase").doc(clientUrl);
        const clientDoc = await clientDocRef.get();

        if (!clientDoc.exists) {
            console.warn(`Client document not found for: ${clientUrl}`);
            return;
        }

        const clientData = clientDoc.data();
        if (!clientData || !clientData.panorama) {
            console.warn(`No panorama found for client: ${clientUrl}`);
            return;
        }

        let panoramaPath = clientData.panorama; // Firestore path for panorama
        console.log(`Panorama path from Firestore: ${panoramaPath}`);

        // If it's a Firebase Storage URL, convert it to a downloadable URL
        if (panoramaPath.startsWith("gs://")) {
            const panoramaRef = storage.refFromURL(panoramaPath);
            panoramaPath = await panoramaRef.getDownloadURL();
        }

        console.log("Loading panorama:", panoramaPath);

        // Load the panorama texture
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            panoramaPath,
            (texture) => {
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.mapping = THREE.EquirectangularReflectionMapping;
                scene.background = texture;
                renderer.setClearColor(0xffffff, 1);
                console.log("✅ Panorama loaded successfully!");
            },
            undefined,
            (error) => {
                console.error("❌ Error loading panorama texture:", error);
            }
        );

    } catch (error) {
        console.error("❌ Error fetching panorama:", error);
    }
}

loadPanorama(clientUrl)

// Create camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 0.5, 1.5);

// Orbit Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.minDistance = 0.5;
controls.maxDistance = 5;
controls.zoomSpeed = 0.5;
controls.enablePan = false;
controls.minPolarAngle = 0.1;
controls.maxPolarAngle = (Math.PI / 2) + 0.6;


// Store original camera position

/****************************************
 *         2. Lighting (Optional)       *
 ****************************************/
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

/****************************************
 * 3. GLTF Loader and Model Management  *
 ****************************************/
// DRACOLoader setup
const dracoLoader = new THREE.DRACOLoader();
dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.144.0/examples/js/libs/draco/gltf/');

// GLTFLoader with Draco support
const loader = new THREE.GLTFLoader();
loader.setDRACOLoader(dracoLoader);

let assets = {}

// Data for 3D assets
// const assets = {
//     starters: [
//         "assets/starters/plant.glb",
//         "assets/starters/random.glb"
//     ],
//     main: [
//         "assets/mains/noodles.glb",
//         "assets/mains/mandu.glb",
//         "assets/mains/beef_rice.glb"
//     ],
//     desserts: [
//         "assets/deserts/milk.glb",
//         "assets/deserts/Muffin.glb"
//     ]
// };

// // Data for corresponding PNG images
// const imageAssets = {
//     starters: [
//         "assets/food_description/mandu.png",
//         "assets/food_description/mandu.png"
//     ],
//     main: [
//         "assets/food_description/noodles.png",
//         "assets/food_description/mandu.png",
//         "assets/food_description/beef_rice.png"
//     ],
//     desserts: [
//         "assets/food_description/mandu.png",
//         "assets/food_description/mandu.png"
//     ]
// };

let currentCategory = "main";
let currentIndex = 0;
document.getElementById("category").value = "main";

let loadedModels = [];    // Objects currently in the scene (food models + planes)
let loadCounter = 0;      // To cancel out-of-date loads (if user switches too fast)
let tableModel = null;    // The table reference
let z_offset = -0.3;
let labelPlane = null;

// --- NEW: Keep track of preloaded assets so we can reuse them ---
const preloaded3DModels = {};  // { modelPath: THREE.Group (GLTF scene) }
const preloadedTextures = {};  // { imagePath: THREE.Texture }

const foodItems = [];  // This is the global array to store all food items
const foodItemsSorted = new Map();  // Initialize the map to store sorted food items by category


class FoodItem {
    constructor(id, category, description, foodModel, foodName, isActive, price) {
        this.id = id;
        this.category = category;
        this.description = description;
        this.foodModel = foodModel;
        this.foodName = foodName;
        this.isActive = isActive;
        this.price = price;
    }

    static fromData(foodDoc) {
        const foodData = foodDoc.data();
        if (!foodData) {
            console.warn(`⚠️ Food data is undefined for document ID: ${foodDoc.id}`);
            return null;
        }

        const {
            category = 'undefined',
            description = '',
            foodModel = '',
            foodName = '',
            isActive = false,
            price = ''
        } = foodData;

        return new FoodItem(foodDoc.id, category, description, foodModel, foodName, isActive, price);
    }
}

async function fetchFoodModels(clientUrl) {
    console.log(`\n--- Fetching 3D models for client: ${clientUrl} ---`);

    try {
        // Reference to the client's document
        const clientDocRef = db.collection("menuDatabase").doc(clientUrl);
        console.log("Client document reference:", clientDocRef.path);

        const foodItemsCollection = clientDocRef.collection("foodItems");
        console.log("Fetching food items...");

        const foodSnapshot = await foodItemsCollection.get();
        console.log(`Total food items found: ${foodSnapshot.docs.length}`);

        const loadedModels = []; // Reset the loadedModels array (local to this function)

        for (const foodDoc of foodSnapshot.docs) {
            const foodItem = FoodItem.fromData(foodDoc);

            if (foodItem) {
                console.log(`\nProcessing food item: ${foodItem.id}`, foodItem);

                // Handle fetching the GLB URL if available
                if (!foodItem.foodModel) {
                    console.warn(`⚠️ No food model URL for: ${foodItem.id}`);
                    continue;
                }

                try {
                    // Convert gs:// URL to downloadable URL
                    console.log(`Fetching GLB URL for ${foodItem.id}:`, foodItem.foodModel);
                    const glbRef = storage.refFromURL(foodItem.foodModel);
                    const glbDownloadUrl = await glbRef.getDownloadURL();

                    loadedModels.push(glbDownloadUrl);
                    foodItems.push(foodItem);  // **Push into the global foodItems array**
                    console.log(`✅ Added model for ${foodItem.foodName} (${foodItem.category}): ${glbDownloadUrl}`);
                } catch (err) {
                    console.error(`❌ Error fetching model for ${foodItem.foodName}:`, err);
                }
            }
        }

        // Sorting foodItems by category and storing them in the foodItemsSorted map
        foodItems.forEach((foodItem) => {
            const category = foodItem.category.toLowerCase();  // Ensure category consistency

            if (!foodItemsSorted.has(category)) {
                foodItemsSorted.set(category, []);  // Create an empty array for new categories
            }

            const categoryItems = foodItemsSorted.get(category);

            // Check if the item already exists in the category based on its ID
            const exists = categoryItems.some(item => item.id === foodItem.id);

            if (!exists) {
                categoryItems.push(foodItem);  // Add only if it's not a duplicate
            }
        });

        console.log("\n--- Fetch Complete! ---");
        console.log("Loaded models:", loadedModels);
        console.log("Food items sorted by category:", foodItemsSorted);  // Now you can access foodItems by category
        return loadedModels;

    } catch (error) {
        console.error("❌ Error fetching food items:", error);
        return [];
    }
}





/****************************************
 *          3a. Preload Functions       *
 ****************************************/
/**
 * Preloads a single model & its texture in the background and stores them.
 */
// Preload a single model for a given category and index
async function preloadModel(category, index) {
    // Check if the category and index exist in foodItemsSorted
    const foodItemsInCategory = foodItemsSorted.get(category);
    if (!foodItemsInCategory || index < 0 || index >= foodItemsInCategory.length) {
        console.error(`No food item found for category: ${category}, index: ${index}`);
        return;
    }

    const foodItem = foodItemsInCategory[index];
    if (!foodItem.foodModel) {
        console.warn(`No model URL for food item: ${foodItem.foodName}`);
        return;
    }

    const modelPath = foodItem.foodModel;

    // If the model is already preloaded, skip loading
    if (preloaded3DModels[modelPath]) {
        console.log(`Model already preloaded: ${modelPath}`);
        return;
    }

    // Load the model if it's not already preloaded
    console.log(`Loading 3D model: ${modelPath}`);
    loader.load(
        modelPath,
        (gltf) => {
            preloaded3DModels[modelPath] = gltf.scene;  // Cache the model
            console.log(`Preloaded 3D model: ${modelPath}`);
        },
        undefined,  // You can add a progress function if needed
        (err) => {
            console.error(`Error preloading model ${modelPath}:`, err);
        }
    );
}

// Preload all models in a category
// async function preloadCategoryModels(category) {
//     console.log("This is food items sorted: ", foodItemsSorted);
//     console.log("Entries in the Map:", Array.from(foodItemsSorted.entries()));
//     const foodItemsInCategory = foodItemsSorted;
//     console.log("foodItemsInCat: ", foodItemsInCategory);
//     if (!foodItemsInCategory) {
//         console.warn(`No food items found in category: ${category}`);
//         return;
//     }

//     console.log(`Preloading all models for category: ${category}`);
//     console.log("preloading all modesl: ", foodItemsInCategory);
//     for (let index = 0; index < foodItemsInCategory.size; index++) {
//         console.log("food item loop: ", foodItemsInCategory.get(index));
//         await preloadModel(category, index);  // Preload each model
//     }
// }



// document.addEventListener('DOMContentLoaded', () => {
//     preloadCategoryModels(currentCategory);  // Preload models for the current category
// });



/****************************************
 * 3b. Table Model (loads once)         *
 ****************************************/
// async function loadTableModel(clientUrl) {
//     try {
//         console.log(`\n--- Fetching table model for client: ${clientUrl} ---`);

//         // Reference to the client's document in Firestore
//         const clientDocRef = db.collection("menuDatabase").doc(clientUrl);
//         const clientDoc = await clientDocRef.get();

//         if (!clientDoc.exists) {
//             console.warn(`Client document not found for: ${clientUrl}`);
//             return;
//         }

//         const clientData = clientDoc.data();
//         if (!clientData || !clientData.table) {
//             console.warn(`No table model found for client: ${clientUrl}`);
//             return;
//         }

//         const tablePath = clientData.table; // Firestore path for table model
//         console.log(`Table model path from Firestore: ${tablePath}`);

//         // Convert gs:// URL to downloadable URL
//         const glbRef = storage.refFromURL(tablePath);
//         const tableModelUrl = await glbRef.getDownloadURL();

//         console.log("Loading table model:", tableModelUrl);

//         // Load the table model
//         loader.load(
//             tableModelUrl,
//             (gltf) => {
//                 tableModel = gltf.scene;
//                 scene.add(tableModel);

//                 // Scale & position
//                 tableModel.scale.set(1.05, 1.05, 1.05);
//                 tableModel.position.set(0, -0.415 + z_offset, 0);
//                 tableModel.rotation.y = 0;

//                 console.log("✅ Table model loaded successfully!");
//             },
//             undefined,
//             (error) => {
//                 console.error("❌ Error loading table model:", error);
//             }
//         );

//     } catch (error) {
//         console.error("❌ Error fetching table model:", error);
//     }
// }

async function loadTableModel(clientUrl) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(`\n--- Fetching table model for client: ${clientUrl} ---`);

            const clientDocRef = db.collection("menuDatabase").doc(clientUrl);
            const clientDoc = await clientDocRef.get();

            if (!clientDoc.exists) {
                console.warn(`Client document not found for: ${clientUrl}`);
                return resolve();
            }

            const clientData = clientDoc.data();
            if (!clientData || !clientData.table) {
                console.warn(`No table model found for client: ${clientUrl}`);
                return resolve();
            }

            const tablePath = clientData.table;
            console.log(`Table model path from Firestore: ${tablePath}`);

            const glbRef = storage.refFromURL(tablePath);
            const tableModelUrl = await glbRef.getDownloadURL();

            console.log("Loading table model:", tableModelUrl);

            loader.load(
                tableModelUrl,
                (gltf) => {
                    tableModel = gltf.scene;
                    scene.add(tableModel);

                    tableModel.scale.set(1.05, 1.05, 1.05);
                    tableModel.position.set(0, -0.415 + z_offset, 0);
                    tableModel.rotation.y = 0;

                    console.log("✅ Table model loaded successfully!");
                    resolve(); // Mark as complete
                },
                undefined,
                (error) => {
                    console.error("❌ Error loading table model:", error);
                    resolve(); // Ensure it resolves even on error
                }
            );

        } catch (error) {
            console.error("❌ Error fetching table model:", error);
            resolve();
        }
    });
}

/****************************************
 * 3c. Removing Previous Models         *
 ****************************************/
function removeAllModels() {
    loadedModels.forEach((obj) => {
        scene.remove(obj);
        obj.traverse?.((child) => {
            if (child.isMesh) {
                child.geometry.dispose();
                if (child.material.map) child.material.map.dispose();
                child.material.dispose();
            }
        });
    });
    loadedModels = [];
}

/****************************************
 *     3d. Load Current Model           *
 ****************************************/

// async function loadInitialModels(clientUrl) {
//     try {
//         const foodModels = await fetchFoodModels(clientUrl); // Get food models for client
//         console.log("Categories for food: ", menuCategories);

//         if (!foodModels.length) {
//             console.warn("No food models found for this client.");
//             return;
//         }

//         const foodItemsInCategory = foodItemsSorted.get(currentCategory) || [];

//         if (!foodItemsInCategory.length) {
//             console.warn(`No food items found for category "${currentCategory}".`);
//             return;
//         }

//         console.log(`Loading all models for category: ${currentCategory}`);

//         const thisLoadID = ++loadCounter;
//         removeAllModels(); // Cleanup before loading

//         let isFirstModel = true; // Track the first model

//         for (let foodItem of foodItemsInCategory) {
//             if (!foodItem.foodModel) continue;

//             try {
//                 const glbRef = storage.refFromURL(foodItem.foodModel);
//                 const modelPath = await glbRef.getDownloadURL();

//                 loader.load(
//                     modelPath,
//                     (gltf) => {
//                         if (thisLoadID !== loadCounter) {
//                             console.warn("Old load finished after a newer request—ignoring.");
//                             return;
//                         }

//                         gltf.scene.visible = isFirstModel; // First model is visible, others are hidden
//                         preloaded3DModels[modelPath] = gltf.scene;

//                         finalizeModelAndPlane(gltf.scene, null, thisLoadID, foodItem);

//                         isFirstModel = false; // Only the first model should be visible
//                     },
//                     undefined,
//                     (error) => console.error(`Error loading model ${modelPath}:`, error)
//                 );

//             } catch (err) {
//                 console.error(`❌ Error fetching model for ${foodItem.foodName}:`, err);
//             }
//         }

//         console.log("✅ All models preloaded:", preloaded3DModels);

//     } catch (error) {
//         console.error("Error loading models:", error);
//     }
// }

async function loadInitialModels(clientUrl) {
    return new Promise(async (resolve, reject) => {
        try {
            const foodModels = await fetchFoodModels(clientUrl);
            console.log("Categories for food: ", menuCategories);

            if (!foodModels.length) {
                console.warn("No food models found for this client.");
                return resolve();
            }

            const foodItemsInCategory = foodItemsSorted.get(currentCategory) || [];
            if (!foodItemsInCategory.length) {
                console.warn(`No food items found for category "${currentCategory}".`);
                return resolve();
            }

            console.log(`Loading all models for category: ${currentCategory}`);

            const thisLoadID = ++loadCounter;
            let isFirstModel = true;

            let loadPromises = foodItemsInCategory.map(async (foodItem) => {
                if (!foodItem.foodModel) return;

                try {
                    const glbRef = storage.refFromURL(foodItem.foodModel);
                    const modelPath = await glbRef.getDownloadURL();

                    return new Promise((modelResolve) => {
                        loader.load(
                            modelPath,
                            (gltf) => {
                                if (thisLoadID !== loadCounter) {
                                    console.warn("Old load finished after a newer request—ignoring.");
                                    return modelResolve();
                                }

                                gltf.scene.visible = isFirstModel;
                                preloaded3DModels[modelPath] = gltf.scene;

                                finalizeModelAndPlane(gltf.scene, null, thisLoadID, foodItem);

                                isFirstModel = false;
                                modelResolve();
                            },
                            undefined,
                            (error) => {
                                console.error(`Error loading model ${modelPath}:`, error);
                                modelResolve();
                            }
                        );
                    });
                } catch (err) {
                    console.error(`❌ Error fetching model for ${foodItem.foodName}:`, err);
                }
            });

            await Promise.all(loadPromises); // Wait for all models to load
            console.log("✅ All models preloaded:", preloaded3DModels);
            resolve(); // Mark as complete
        } catch (error) {
            console.error("Error loading models:", error);
            resolve();
        }
    });
}




async function finalizeModelAndPlane(gltfScene, texture, loadID, foodItem) {
    if (loadID !== loadCounter) return;

    console.log("🔧 Finalizing model and plane...", gltfScene);

    // Add model to the scene
    const model = gltfScene;
    model.isFoodModel = true;
    scene.add(model);
    loadedModels.push(model);
    console.log("✅ Model added to scene. Loaded models count:", loadedModels.length);

    model.scale.set(5, 5, 5);

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    model.position.sub(center);
    model.position.y += (size.y / 2 + 0.00) + z_offset;

    console.log("📐 Model centered and positioned.");

    // ✅ Convert `gs://` to HTTPS URL in Firebase v8
    if (!foodItem.description) {
        console.warn("⚠️ No description provided, skipping plane creation.");
        return;
    }

    try {
        const storageRef = firebase.storage().refFromURL(foodItem.description);
        const descriptionUrl = await storageRef.getDownloadURL();

        console.log("🖼️ Loading PNG description from:", descriptionUrl);

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            descriptionUrl,
            (descriptionTexture) => {
                // Create a plane matching the image's aspect ratio
                const aspectRatio = descriptionTexture.image.width / descriptionTexture.image.height;
                const planeWidth = 2; // Arbitrary base width
                const planeHeight = planeWidth / aspectRatio;

                const planeGeom = new THREE.PlaneGeometry(planeWidth, planeHeight);
                const planeMat = new THREE.MeshStandardMaterial({
                    map: descriptionTexture,
                    roughness: 0.8,
                    metalness: 0,
                    transparent: true,
                });

                const plane = new THREE.Mesh(planeGeom, planeMat);

                let sf = 0.5;
                plane.scale.set(sf, sf, sf);
                plane.rotation.x = -0.3;
                plane.position.set(0.0, (0.6 + z_offset), -0.4);

                labelPlane = plane;
                plane.isFoodModel = false;
                scene.add(plane);
                loadedModels.push(plane);
                console.log("✅ Description PNG plane added to scene.");

                // Store model-plane pair in a map for synchronized visibility
                modelPlaneMap.set(model, plane);
                plane.visible = model.visible;

                console.log("🖱️ Adding zoom on click event to description plane.");

                // Update OrbitControls target
                controls.target.set(0, 0, 0);
                controls.update();
                console.log("🎯 OrbitControls target updated.");

                addInitialAnimations(model);
                console.log("🎬 Initial animations added.");
            },
            undefined,
            (error) => {
                console.error("❌ Failed to load description image:", error);
            }
        );
    } catch (error) {
        console.error("❌ Error fetching Firebase Storage URL:", error);
    }
}






/**
 * Helper to position the model, create the plane with the given texture, etc.
 */

const modelPlaneMap = new Map(); // Store model-plane pairs


// --- Text Wrapping Function ---
function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let yOffset = 0;

    for (let i = 0; i < words.length; i++) {
        let testLine = line + words[i] + " ";
        let metrics = context.measureText(testLine);
        let testWidth = metrics.width;

        if (testWidth > maxWidth && i > 0) {
            context.fillText(line, x, y + yOffset);
            line = words[i] + " ";
            yOffset += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, y + yOffset);
}


// Function to calculate maximum font size
function calculateMaxFontSize(ctx, text, maxWidth, maxHeight) {
    let fontSize = maxHeight; // Start with maxHeight as an initial guess
    ctx.font = `${fontSize}px Arial`;

    while (ctx.measureText(text).width > maxWidth && fontSize > 10) {
        fontSize--; // Decrease font size until it fits
        ctx.font = `${fontSize}px Arial`;
    }

    console.log(`⚙️ Calculated font size for "${text}" is ${fontSize}px (Max Width: ${maxWidth}, Max Height: ${maxHeight})`);
    return fontSize;
}



/****************************************
 *      4. UI Functions (Next/Prev)     *
 ****************************************/
const categoryDropdown = document.getElementById("category");

async function switchCategory() {
    currentCategory = categoryDropdown.value;  // Get the selected category
    currentIndex = 0;  // Reset the index or set it as needed

    // Log the food items for the selected category from foodItemsSorted
    if (foodItemsSorted.has(currentCategory)) {
        console.log(`Food items for category "${currentCategory}":`, foodItemsSorted.get(currentCategory));
    } else {
        console.warn(`No food items found for category "${currentCategory}".`);
    }

    // Load the model based on the selected category
    loadModel(clientUrl, currentCategory);
    // preloadCategoryModels(currentCategory);
}


// Add event listener to handle category selection change
categoryDropdown.addEventListener("change", switchCategory);

async function loadModel(clientUrl, currentCategory) {
    try {
        console.log(`\n--- Loading Model for Category: ${currentCategory} ---`);

        // Get food items for the selected category
        const foodItemsInCategory = foodItemsSorted.get(currentCategory) || [];
        if (foodItemsInCategory.length === 0) {
            console.warn(`No food items found for category "${currentCategory}".`);
            return;
        }

        // Ensure currentIndex is within bounds
        currentIndex = currentIndex % foodItemsInCategory.length;
        const selectedFoodItem = foodItemsInCategory[currentIndex];

        if (!selectedFoodItem || !selectedFoodItem.foodModel) {
            console.warn(`No valid model found for item at index ${currentIndex} in "${currentCategory}".`);
            return;
        }

        console.log(`Loading food item: ${selectedFoodItem.foodModel}`);

        // Convert gs:// URL to downloadable URL
        let modelPath;
        try {
            const glbRef = storage.refFromURL(selectedFoodItem.foodModel);
            modelPath = await glbRef.getDownloadURL();
        } catch (err) {
            console.error(`❌ Error fetching model for ${selectedFoodItem.foodName}:`, err);
            return;
        }

        console.log("Loading model:", modelPath);

        const thisLoadID = ++loadCounter;

        // ✅ Check if model is already loaded & stored in `preloaded3DModels`
        if (preloaded3DModels[modelPath]) {
            console.log("✅ Model already preloaded:", modelPath);

            // Hide all labels except the one for the currently visible model
            modelPlaneMap.forEach((plane, model) => {
                plane.visible = false;  // Hide all labels
            });
            if (modelPlaneMap.has(preloaded3DModels[modelPath])) {
                modelPlaneMap.get(preloaded3DModels[modelPath]).visible = true;  // Show correct label
            }


            // Hide all other models except this one
            Object.values(preloaded3DModels).forEach(model => model.visible = false);
            preloaded3DModels[modelPath].visible = true;

            // Ensure it's finalized if not already in `loadedModels`
            if (!loadedModels.includes(preloaded3DModels[modelPath])) {
                finalizeModelAndPlane(preloaded3DModels[modelPath], null, thisLoadID, selectedFoodItem);
            }
            return;
        }

        // ✅ Load model only if it's NOT preloaded
        loader.load(
            modelPath,
            (gltf) => {
                if (thisLoadID !== loadCounter) {
                    console.warn("⚠️ Old load finished after a newer request—ignoring.");
                    return;
                }
                console.log("📦 Model loaded:", modelPath);

                // Store the model and ensure visibility is managed correctly
                preloaded3DModels[modelPath] = gltf.scene;
                Object.values(preloaded3DModels).forEach(model => model.visible = false);
                gltf.scene.visible = true;

                finalizeModelAndPlane(gltf.scene, null, thisLoadID, selectedFoodItem);
            },
            undefined,
            (error) => console.error("❌ Error loading model:", error)
        );

    } catch (error) {
        console.error("❌ Error loading model:", error);
    }
}



function logInvisibleObjects(scene) {
    console.log("🔍 Checking for invisible objects...");

    scene.traverse((object) => {
        if (!object.visible) {
            console.log(`🚫 Invisible Object: ${object.id || "[Unnamed Object]"} | Type: ${object.type}`);
        }
    });

    console.log("✅ Logging complete.");
}

function nextModel() {
    logInvisibleObjects(scene);
    const foodItemsInCategory = foodItemsSorted.get(currentCategory) || [];
    if (foodItemsInCategory.length === 0) {
        console.warn("No food items available in this category.");
        return;
    }

    const previousIndex = currentIndex;
    currentIndex = (currentIndex + 1) % foodItemsInCategory.length;

    console.log(`Next item: ${foodItemsInCategory[currentIndex].foodName}`);
    loadModel(clientUrl, currentCategory);
}

function prevModel() {
    logInvisibleObjects(scene);
    const foodItemsInCategory = foodItemsSorted.get(currentCategory) || [];
    if (foodItemsInCategory.length === 0) {
        console.warn("No food items available in this category.");
        return;
    }

    const previousIndex = currentIndex;
    currentIndex = (currentIndex - 1 + foodItemsInCategory.length) % foodItemsInCategory.length;

    console.log(`Previous item: ${foodItemsInCategory[currentIndex].foodName}`);
    loadModel(clientUrl, currentCategory);
}


/****************************************
 *     5. Initial Setup & Rendering     *
 ****************************************/

// Add event listeners for UI controls
document.getElementById('prevButton').addEventListener('click', prevModel);
document.getElementById('nextButton').addEventListener('click', nextModel);
document.getElementById('category').addEventListener('change', switchCategory);

// Add raycaster and mouse objects to handle interactions
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

/****************************************
 *          4a. Event Listeners         *
 ****************************************/





/****************************************
 *      Camera Zoom Functionality       *
 ****************************************/

/**
 * Handles mouse clicks to detect interaction with the description plane.
 */


// Function to add click event to the plane
// Store original camera position

let originalCameraPosition = new THREE.Vector3();




/**
 * Animates the camera to focus on the clicked description plane.
 */
/**
 * Animates the camera to focus on the clicked description plane.
 */


/**
 * Resets the camera to its initial position and rotation.
 */
// Assume `camera` is your THREE.PerspectiveCamera or any other camera used
let initialCameraState = {};

// Save the initial state of the camera
function saveInitialCameraState(camera) {
    initialCameraState = {
        position: camera.position.clone(),
        rotation: camera.rotation.clone(),
        fov: camera.fov,
    };
}




/****************************************
 *      Food Rotation Control Logic     *
 ****************************************/

/**
 * Handles mouse down events to stop food rotation.
 */

// Add mouse down/up listeners for rotation control
window.addEventListener('pointerdown', onPointerDown);
window.addEventListener('pointerup', resumeRotation);

function onPointerMove(event) {

    if (event.touches && event.touches.length > 0) {
        pointer.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
    } else {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

}
window.addEventListener('pointermove', onPointerMove);
let lastClickTime = 0;
let isZoomedIn = false; // Track zoom state
const initialCameraPosition = camera.position.clone(); // Store initial position


function onPointerDown(event) {
    const now = performance.now();
    if (now - lastClickTime < 100) return; // Prevent rapid re-execution
    lastClickTime = now;

    if (event.touches && event.touches.length > 0) {
        pointer.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
    } else {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }


    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(labelPlane); // Check if label was clicked

    if (intersects.length <= 0 && isZoomedIn) {
        //Zoom out
        gsap.to(camera.position, {
            x: initialCameraPosition.x,
            y: initialCameraPosition.y,
            z: initialCameraPosition.z,
            duration: 1,
            ease: "power2.out",
            onUpdate: () => camera.lookAt(0, 0.5, 1.5) // Look at scene center (or adjust)
        });

        // Reset orbit controls' target to the initial scene center
        gsap.to(controls.target, {
            x: 0,
            y: 0,
            z: 0,
            duration: 1,
            ease: "power2.out"
        });
        isZoomedIn = false;

    }

    if (intersects.length > 0) {
        console.log("✅ Label was clicked/tapped.");

        if (isZoomedIn) {
            // Zoom Out (Back to Initial Position)
            gsap.to(camera.position, {
                x: initialCameraPosition.x,
                y: initialCameraPosition.y,
                z: initialCameraPosition.z,
                duration: 1,
                ease: "power2.out",
                onUpdate: () => camera.lookAt(0, 0.5, 1.5) // Look at scene center (or adjust)
            });

            // Reset orbit controls' target to the initial scene center
            gsap.to(controls.target, {
                x: 0,
                y: 0,
                z: 0,
                duration: 1,
                ease: "power2.out"
            });
            isZoomedIn = false;
        } else {
            // Zoom In to Label
            const labelPosition = labelPlane.position.clone();
            console.log("LABEL Position: ", labelPosition);

            const zoomPosition = new THREE.Vector3(
                labelPosition.x,
                labelPosition.y + .3,
                labelPosition.z + 0.8 // Adjust zoom-in distance
            );

            gsap.to(camera.position, {
                x: zoomPosition.x,
                y: zoomPosition.y,
                z: zoomPosition.z,
                duration: 1,
                ease: "power2.out",
                onUpdate: () => camera.lookAt(labelPlane.position)
            });

            // Set orbit controls' target to the label position
            gsap.to(controls.target, {
                x: labelPosition.x,
                y: labelPosition.y,
                z: labelPosition.z,
                duration: 1,
                ease: "power2.out"
            });


            isZoomedIn = true;
        }
    } else {
        console.log("❌ No label detected under the pointer.");
    }

    console.log("🖱️✋ Pointer down detected.");
    console.log("⏸️ Stopping rotation.");
    stopRotation();
}


// Replace 'mousedown' with 'pointerdown' for cross-device support


/**
 * Stops rotation of the current food model.
 */
function stopRotation() {
    if (loadedModels.length === 0) {
        console.warn("No models loaded to stop rotation.");
        return;
    }

    loadedModels.forEach((model) => {
        if (model.isFoodModel) {  // ✅ Only stop rotation for food models
            animations.removeAnimation(model, "rotate");
            console.log("🛑 Stopped rotation for model:", model);
        }
    });
}
/**
 * Resumes rotation of the current food model.
 */
function resumeRotation() {
    if (loadedModels.length === 0) {
        console.warn("No models loaded to resume rotation.");
        return;
    }

    loadedModels.forEach((model) => {
        if (model.isFoodModel) {  // ✅ Only apply rotation to food models
            animations.addAnimation(model, "rotate", { speed: 0.001 });
            console.log("✅ Rotation resumed for model:", model);
        }
    });
}




// Add animations after the first model is loaded
function addInitialAnimations(model) {
    console.log("animaton added to: ", model)
    if (loadedModels.length > 0) {
        const firstModel = loadedModels[0];
        console.log("firstModel " + firstModel)

        // Add rotation and scale pulse animations
        animations.addAnimation(model, "rotate", { speed: 0.001 });
        // animations.addAnimation(model, "scalePulse", {
        //     minScale: 0.8,
        //     maxScale: 1.2,
        //     speed: 0.5,
        // });
    } else {
        console.warn("No models loaded to apply animations.");
    }
}


// Render loop
function animate() {
    requestAnimationFrame(animate);

    // Update animations only if rotation is enabled
    if (isRotating) {
        animations.updateAnimations();
    }

    controls.update();
    renderer.render(scene, camera);
}



// async function init() {


//     // console.log("testing all clients:")
//     // fetchAllClients();
//     // Example usage known client:
//     // fetchClient("4gQSySoYgodgBAFnk64i");
//     // Example usage url
//     fetchClient(clientUrl);

//     menuCategories = await getMenuCategories(clientUrl)
//     populateCategories(clientUrl)
//     console.log("Menu Categories:", menuCategories);

//     fetchFileUrl()
//     // await fetchFoodModels(); // Fetch data before initializing models
//     // preloadModel(currentCategory, currentIndex);
//     loadTableModel(clientUrl);   // Table persists
//     // loadInitialModels(clientUrl, menuCategories[0].toLowerCase());        // Load initial food model
//     loadInitialModels(clientUrl); 
//     // preloadCategoryModels(menuCategories[0]);
//     saveInitialCameraState(camera); // Save this starting state
//     // Ensure animations are added after the first model is loaded
//     addInitialAnimations();
//     animate();
// }

//run

function showLoader() {
    document.getElementById("loader").style.display = "flex";
}

function hideLoader() {
    const loader = document.getElementById("loader");
    loader.classList.add("fade-out"); // Add fade-out effect
    setTimeout(() => {
        loader.style.display = "none"; // Hide after animation completes
    }, 1000);
}

async function init() {
    showLoader(); // Show loader before loading starts

    try {
        fetchClient(clientUrl);

        menuCategories = await getMenuCategories(clientUrl);
        populateCategories(clientUrl);
        console.log("Menu Categories:", menuCategories);

        fetchFileUrl();
        saveInitialCameraState(camera);
        addInitialAnimations();
        animate();

        // Wait for both models to load before hiding the loader
        await Promise.all([loadTableModel(clientUrl), loadInitialModels(clientUrl)]);

        console.log("✅ All assets loaded successfully!");
    } catch (error) {
        console.error("❌ Error during initialization:", error);
    } finally {
        hideLoader(); // Hide loader with fade-out effect
    }
}

init();