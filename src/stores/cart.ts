import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useCartStore = defineStore(
    "cart",
    () => {
        const cart = ref<any[]>([]);
        const cartTotal = computed(() => cart.value.reduce((sum, item) => sum + (item.variant_price || item.price) * item.selected_quantity, 0));
        const cartLength = computed(() => cart.value.length);

        // 🛒 Add items to the cart
        function addToCart(
            product: any,
            selections: { variant1: string; variant2: string; quantity: number },
            price: number,
            stockLeft: number,
        ) {
            const item = cart.value.find(
                (i) =>
                    i.id === product.id &&
                    i.selected_variant1 === selections.variant1 &&
                    i.selected_variant2 === selections.variant2,
            );
            if (item) {
                item.selected_quantity = selections.quantity;
            } else {
                const cartItem = { ...product } as any;
                cartItem.selected_variant1 = selections.variant1;
                cartItem.selected_variant2 = selections.variant2;
                cartItem.selected_quantity = selections.quantity;
                cartItem.variant_price = price;
                cartItem.variant_total_stock = stockLeft;
                cartItem.itemTotal = product.price * selections.quantity;
                cart.value.push(cartItem);
            }
        }

        // 🔍 Check if a product with exact variants is in the cart
        function getCartItemQuantity(product: any, selections: { variant1: string; variant2: string }) {
            const item = cart.value.find(
                (i) =>
                    i.id === product.id &&
                    i.selected_variant1 === selections.variant1 &&
                    i.selected_variant2 === selections.variant2,
            );
            return item ? item.selected_quantity : 0;
        }

        // ✅ Remove a specific selection from the cart
        function removeSelection(product: any, selections: { variant1: string; variant2: string }) {
            cart.value = cart.value.filter(
                (i) =>
                    !(
                        i.id === product.id &&
                        i.selected_variant1 === selections.variant1 &&
                        i.selected_variant2 === selections.variant2
                    ),
            );
        }

        // ➕ Increase quantity of a selection
        function increaseSelectionQuantity(product: any, selections: { variant1: string; variant2: string }) {
            const item = cart.value.find(
                (i) =>
                    i.id === product.id &&
                    i.selected_variant1 === selections.variant1 &&
                    i.selected_variant2 === selections.variant2,
            );
            if (item) {
                if (item.selected_quantity < (item.variant_total_stock || item.total_stock)) {
                    item.selected_quantity += 1;
                    item.itemTotal = item.variant_price * item.selected_quantity;
                }
            }
        }

        // ➖ Decrease quantity of a selection (removes item if quantity reaches 0)
        function decreaseSelectionQuantity(product: any, selections: { variant1: string; variant2: string }) {
            const item = cart.value.find(
                (i) =>
                    i.id === product.id &&
                    i.selected_variant1 === selections.variant1 &&
                    i.selected_variant2 === selections.variant2,
            );
            if (item) {
                item.selected_quantity -= 1;
                if (item.selected_quantity <= 0) {
                    removeSelection(product, selections);
                } else {
                    item.itemTotal = item.variant_price * item.selected_quantity;
                }
            }
        }

        function isProductInCart(product: any) {
            return cart.value.some((i) => i.id === product.id);
        }

        function uniqueProductsCount() {
            const uniqueIds = new Set(cart.value.map((i) => i.id));
            return uniqueIds.size;
        }

        return {
            cart,
            cartTotal,
            cartLength,
            addToCart,
            getCartItemQuantity,
            isProductInCart,
            uniqueProductsCount,
            removeSelection,
            increaseSelectionQuantity,
            decreaseSelectionQuantity,
        };
    },

    {
        persist: {
            key: "cartStore",
            storage: localStorage,
        },
    },
);
