# Checkout Popup System

## Overview

The Checkout Popup system replaces the full-screen checkout flow with a modal-based approach, providing a better user experience for mobile devices.

## Features

- **Modal-based checkout**: Opens as a popup instead of navigating to a new screen
- **Multi-step process**: 4-step checkout flow (Customer Info → Measurements → Accessories → Confirmation)
- **Support for both SELL and RENT**: Handles both purchase and rental scenarios
- **Accessory selection**: Integrates with shop accessories API
- **Responsive design**: Optimized for mobile screens
- **Form validation**: Ensures required fields are completed before proceeding

## API Integration

The checkout popup integrates with the following APIs:

- **Orders API**: `/orders` - Creates new orders
- **Shop Accessories API**: `/shops/{idshop}/accessories` - Fetches available accessories
- **Dress API**: Gets dress details for pricing and validation

## Data Structure

### Order Request Format

```typescript
{
  "newOrder": {
    "phone": "0123456789",        // From auth
    "email": "customer@example.com", // From auth
    "address": "123 Đường ABC, Quận X, TP Y", // From auth
    "dueDate": "2023-12-31",     // Required
    "returnDate": "2024-01-15",  // Required for RENT, empty for SELL
    "type": "SELL" | "RENT"      // Order type
  },
  "dressDetails": {
    "dressId": "uuid-dress-1",
    "height": 165,               // Required
    "weight": 50,
    "bust": 85,                  // Required
    "waist": 65,                 // Required
    "hip": 90,                   // Required
    "armpit": 10,
    "bicep": 10,
    "neck": 20,
    "shoulderWidth": 40,
    "sleeveLength": 40,
    "backLength": 60,
    "lowerWaist": 50,
    "waistToFloor": 60
  },
  "accessoriesDetails": [
    {
      "accessoryId": "accessory-uuid-1",
      "quantity": 1
    }
  ]
}
```

## Usage

### Basic Implementation

```tsx
import CheckoutPopup from "../components/CheckoutPopup";

function DressDetailScreen() {
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);
  const [checkoutType, setCheckoutType] = useState<"SELL" | "RENT">("SELL");

  const handleOpenCheckout = (type: "SELL" | "RENT") => {
    setCheckoutType(type);
    setShowCheckoutPopup(true);
  };

  const handleCheckoutSuccess = (orderNumber: string) => {
    // Handle successful order creation
    console.log("Order created:", orderNumber);
  };

  return (
    <View>
      {/* Your dress detail content */}

      <TouchableOpacity onPress={() => handleOpenCheckout("SELL")}>
        <Text>Mua váy</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleOpenCheckout("RENT")}>
        <Text>Thuê váy</Text>
      </TouchableOpacity>

      <CheckoutPopup
        visible={showCheckoutPopup}
        onClose={() => setShowCheckoutPopup(false)}
        dressId="dress-uuid"
        type={checkoutType}
        onSuccess={handleCheckoutSuccess}
      />
    </View>
  );
}
```

### Props

| Prop        | Type                            | Required | Description                                 |
| ----------- | ------------------------------- | -------- | ------------------------------------------- |
| `visible`   | `boolean`                       | Yes      | Controls popup visibility                   |
| `onClose`   | `() => void`                    | Yes      | Callback when popup is closed               |
| `dressId`   | `string`                        | Yes      | ID of the dress to checkout                 |
| `type`      | `"SELL" \| "RENT"`              | Yes      | Type of order (purchase or rental)          |
| `onSuccess` | `(orderNumber: string) => void` | No       | Callback when order is successfully created |

## Checkout Steps

### 1. Customer Information

- Phone number (from auth)
- Email (from auth)
- Delivery address (from auth, editable)
- Delivery date (required)
- Return date (required for RENT orders)

### 2. Body Measurements

- Height (required)
- Weight
- Bust (required)
- Waist (required)
- Hip (required)
- Neck, shoulders, arms, etc.

### 3. Accessories Selection

- Browse available accessories from the shop
- Select accessories and quantities
- Optional step

### 4. Order Confirmation

- Review dress details
- Review selected accessories
- Review customer information
- See total price
- Confirm order

## Styling

The popup uses Tailwind CSS classes and follows the app's design system:

- **Primary colors**: Primary-500 for main actions
- **Secondary colors**: Gray tones for secondary elements
- **Responsive**: Adapts to different screen sizes
- **Modal presentation**: Uses React Native's Modal component with pageSheet style

## Error Handling

- Form validation ensures required fields are completed
- API error handling with user-friendly messages
- Loading states during API calls
- Toast notifications for success/error feedback

## Accessibility

- Touch targets meet minimum size requirements
- Clear visual hierarchy
- Proper contrast ratios
- Screen reader friendly

## Future Enhancements

- Save measurement preferences for returning customers
- Integration with payment gateways
- Order tracking integration
- Multi-language support
- Dark mode support
