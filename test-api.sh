#!/bin/bash

# Script de test automatique pour l'API École de la Bourse
# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api"
TOKEN=""

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Tests API - École de la Bourse${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Fonction pour tester un endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local desc=$4

    echo -e "${YELLOW}Testing: ${desc}${NC}"
    echo -e "  ${method} ${endpoint}"

    if [ -z "$data" ]; then
        if [ -z "$TOKEN" ]; then
            response=$(curl -s -X ${method} "${API_URL}${endpoint}")
        else
            response=$(curl -s -X ${method} "${API_URL}${endpoint}" -H "Authorization: Bearer ${TOKEN}")
        fi
    else
        if [ -z "$TOKEN" ]; then
            response=$(curl -s -X ${method} "${API_URL}${endpoint}" -H "Content-Type: application/json" -d "${data}")
        else
            response=$(curl -s -X ${method} "${API_URL}${endpoint}" -H "Content-Type: application/json" -H "Authorization: Bearer ${TOKEN}" -d "${data}")
        fi
    fi

    if echo "$response" | grep -q '"success":true\|"id":\|"data":\|\['; then
        echo -e "  ${GREEN}✓ Success${NC}"
        echo "  Response: $(echo $response | cut -c1-100)..."
    else
        echo -e "  ${RED}✗ Failed${NC}"
        echo "  Response: $response"
    fi
    echo ""
}

# Test 1: Login Admin
echo -e "${BLUE}=== Test 1: Authentication ===${NC}\n"
login_response=$(curl -s -X POST "${API_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@ecoledelabourse.com","password":"Admin123!"}')

TOKEN=$(echo $login_response | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$TOKEN" ]; then
    echo -e "${GREEN}✓ Login successful${NC}"
    echo "  Token: ${TOKEN:0:50}..."
else
    echo -e "${RED}✗ Login failed${NC}"
    echo "  Response: $login_response"
    exit 1
fi
echo ""

# Test 2: Get Current User
test_endpoint "POST" "/auth/me" "" "Get current user info"

# Test 3: Users
echo -e "${BLUE}=== Test 2: Users Module ===${NC}\n"
test_endpoint "GET" "/users" "" "Get all users"
test_endpoint "GET" "/users/me" "" "Get my profile"
test_endpoint "GET" "/users/coaches" "" "Get all coaches"

# Test 4: Cohorts
echo -e "${BLUE}=== Test 3: Cohorts Module ===${NC}\n"
test_endpoint "GET" "/cohorts" "" "Get all cohorts"
test_endpoint "GET" "/cohorts/stats" "" "Get cohorts statistics"

# Test 5: Coaching
echo -e "${BLUE}=== Test 4: Coaching Module ===${NC}\n"
test_endpoint "GET" "/coaching" "" "Get all coaching sessions"
test_endpoint "GET" "/coaching/my-sessions" "" "Get my coaching sessions"

# Test 6: Subscriptions
echo -e "${BLUE}=== Test 5: Subscriptions Module ===${NC}\n"
test_endpoint "GET" "/subscriptions" "" "Get all subscriptions"
test_endpoint "GET" "/subscriptions/my-subscriptions" "" "Get my subscriptions"
test_endpoint "GET" "/subscriptions/statistics" "" "Get subscription statistics"
test_endpoint "GET" "/subscriptions/expiring" "" "Get expiring subscriptions"

# Test 7: Payments
echo -e "${BLUE}=== Test 6: Payments Module ===${NC}\n"
test_endpoint "GET" "/payments" "" "Get all payments"
test_endpoint "GET" "/payments/my-payments" "" "Get my payments"
test_endpoint "GET" "/payments/stats" "" "Get payment statistics"

# Test 8: Dashboard
echo -e "${BLUE}=== Test 7: Dashboard ===${NC}\n"
test_endpoint "GET" "/dashboard" "" "Get dashboard data"

# Test 9: Notifications
echo -e "${BLUE}=== Test 8: Notifications Module ===${NC}\n"
test_endpoint "GET" "/notifications/my-notifications" "" "Get my notifications"

# Test 10: Reports
echo -e "${BLUE}=== Test 9: Reports Module ===${NC}\n"
test_endpoint "GET" "/reports/overview" "" "Get reports overview"
test_endpoint "GET" "/reports/users" "" "Get users report"
test_endpoint "GET" "/reports/revenue" "" "Get revenue report"
test_endpoint "GET" "/reports/cohorts" "" "Get cohorts report"

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Tests completed!${NC}"
echo -e "${BLUE}========================================${NC}"
