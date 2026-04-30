/**
 * Script to test admin API endpoints
 * Run: npx tsx scripts/test-admin-api.ts
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://mnjxcw3o1e.execute-api.ap-southeast-1.amazonaws.com/Prod/";

async function testAdminAPI() {
  console.log("🔍 Testing Admin API Endpoints\n");
  console.log("API URL:", API_URL);
  console.log("Note: You need to provide a valid JWT token\n");

  const token = process.argv[2];
  if (!token) {
    console.error("❌ Error: Please provide JWT token as argument");
    console.log("\nUsage: npx tsx scripts/test-admin-api.ts <JWT_TOKEN>");
    console.log("\nTo get your token:");
    console.log("1. Login to the app");
    console.log("2. Open browser DevTools > Application > Local Storage");
    console.log("3. Find the Cognito token (look for 'idToken' or similar)");
    process.exit(1);
  }

  console.log("Token provided:", token.substring(0, 20) + "...\n");

  // Test 1: GET /admin/users
  console.log("📋 Test 1: GET /admin/users");
  try {
    const response = await fetch(`${API_URL}admin/users`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Status:", response.status, response.statusText);
    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log("✅ Success - Found", data.users?.length || 0, "users\n");
    } else {
      console.log("❌ Failed\n");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }

  // Test 2: GET /admin/scenarios
  console.log("📋 Test 2: GET /admin/scenarios");
  try {
    const response = await fetch(`${API_URL}admin/scenarios`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Status:", response.status, response.statusText);
    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log("✅ Success - Found", data.scenarios?.length || 0, "scenarios\n");
    } else {
      console.log("❌ Failed\n");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }

  // Test 3: GET /profile (to check role)
  console.log("📋 Test 3: GET /profile (check your role)");
  try {
    const response = await fetch(`${API_URL}profile`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Status:", response.status, response.statusText);
    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));

    if (response.ok && data.data) {
      const role = data.data.role;
      console.log(`\n👤 Your role: ${role}`);
      if (role === "ADMIN") {
        console.log("✅ You have ADMIN role - should be able to access admin endpoints\n");
      } else {
        console.log("❌ You have", role, "role - need ADMIN role to access admin endpoints\n");
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testAdminAPI().catch(console.error);
