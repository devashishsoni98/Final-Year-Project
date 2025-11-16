import { extractNumber } from "../utils/voiceHelpers";
import commandParser from "../dialogue/CommandParser";
import { getCartUrl, getStoreUrl } from "../utils/iframeNavigation";

export const createCartFlow = (
  cartContext,
  onCheckout,
  onContinueShopping,
  onCancel
) => {
  return async (userInput, flowState) => {
    const { step, pendingBook, pendingQuantity, pendingItemId, pendingAction } =
      flowState;

    switch (step) {
      case "init": {
        const intent = commandParser.matchIntent(userInput);

        if (
          intent === "viewCart" ||
          /\b(what'?s|show|my|view|check|see|open)\s+(in\s+)?(my\s+)?(cart|card|basket)\b/i.test(userInput)
        ) {
          const summary = cartContext.getCartSummary();

          if (summary.itemCount === 0) {
            return {
              response:
                "Your cart is empty. Say browse books to shop, or continue shopping to return.",
              flowState: { ...flowState, step: "empty-cart" },
              requiresInput: true,
            };
          }

          const itemsList = summary.items
            .map((item, idx) => {
              const copies = item.quantity === 1 ? "copy" : "copies";
              return `Item ${idx + 1}: ${item.name} - ${
                item.quantity
              } ${copies} at ${item.price} rupees each`;
            })
            .join(". ");

          const totalText = `Total: ${summary.total} rupees`;
          const options =
            "Say checkout to buy, continue shopping to add more, remove item followed by a number, or clear cart to empty everything";

          return {
            response: `Cart has ${summary.itemCount} items. ${itemsList}. ${totalText}. ${options}.`,
            flowState: { ...flowState, step: "viewing-cart" },
            iframeNavigation: getCartUrl(),
            requiresInput: true,
          };
        }

        return {
          response: "Say view cart, add to cart, or continue shopping.",
          flowState: { ...flowState, step: "awaiting-command" },
          requiresInput: true,
        };
      }

      case "empty-cart":
      case "awaiting-command": {
        const intent = commandParser.matchIntent(userInput);

        if (
          intent === "browse" ||
          /\b(continue\s+shopping|browse|shop|add\s+more)\b/i.test(userInput)
        ) {
          if (onContinueShopping) {
            onContinueShopping();
          }
          return {
            response: "Returning to browse books.",
            completed: true,
            iframeNavigation: getStoreUrl(),
            requiresInput: false,
          };
        }

        if (
          intent === "viewCart" ||
          /\b(view|show|my|check|see|open)\s+(cart|card|basket)\b/i.test(userInput)
        ) {
          return {
            response: "Checking your shopping basket.",
            flowState: { ...flowState, step: "init" },
            requiresInput: true,
          };
        }

        return {
          response:
            "Say view cart to see items, or continue shopping to browse books.",
          flowState,
          requiresInput: true,
        };
      }

      case "viewing-cart": {
        const intent = commandParser.matchIntent(userInput);

        // accept both "checkout" and "check out" variants (also honor parser intent)
        if (intent === "checkout" || /\bcheck(?:\s|-)?out\b/i.test(userInput)) {
          const summary = cartContext.getCartSummary();
          if (summary.itemCount === 0) {
            return {
              response: "Cart is empty. Add items before checkout.",
              flowState: { ...flowState, step: "empty-cart" },
              requiresInput: true,
            };
          }

          if (onCheckout) {
            onCheckout(summary);
          }

          return {
            response: `Proceeding to checkout with ${summary.itemCount} items totaling ${summary.total} rupees.`,
            completed: true,
            requiresInput: false,
            action: "checkout",
          };
        }

        if (
          /\b(continue\s+shopping|browse|shop|add\s+more)\b/i.test(userInput)
        ) {
          if (onContinueShopping) {
            onContinueShopping();
          }
          return {
            response: "Returning to browse books.",
            completed: true,
            iframeNavigation: getStoreUrl(),
            requiresInput: false,
          };
        }

        if (/\bclear\s+cart\b/i.test(userInput)) {
          return {
            response:
              "Are you sure you want to remove all items from cart? This cannot be undone. Say yes to confirm, or no to cancel.",
            flowState: { ...flowState, step: "confirm-clear" },
            requiresInput: true,
          };
        }

        const removeMatch = userInput.match(
          /\bremove\s+(?:item\s+)?(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/i
        );
        if (removeMatch) {
          const itemNumber = extractNumber(removeMatch[0]);
          const summary = cartContext.getCartSummary();

          if (itemNumber < 1 || itemNumber > summary.items.length) {
            return {
              response: `Item ${itemNumber} does not exist in cart. You have ${summary.items.length} items. Say remove item followed by a number from 1 to ${summary.items.length}.`,
              flowState,
              requiresInput: true,
            };
          }

          const itemToRemove = summary.items[itemNumber - 1];

          return {
            response: `Remove ${itemToRemove.name} from cart? Say yes to confirm, or no to cancel.`,
            flowState: {
              ...flowState,
              step: "confirm-remove",
              pendingItemId: itemToRemove._id,
              pendingItemName: itemToRemove.name,
            },
            requiresInput: true,
          };
        }

        const changeQuantityMatch = userInput.match(
          /\b(change|update)\s+quantity\s+of\s+(?:item\s+)?(\d+|one|two|three|four|five)\b/i
        );
        if (changeQuantityMatch) {
          const itemNumber = extractNumber(changeQuantityMatch[0]);
          const summary = cartContext.getCartSummary();

          if (itemNumber < 1 || itemNumber > summary.items.length) {
            return {
              response: `Item ${itemNumber} does not exist. Say change quantity of item followed by a number from 1 to ${summary.items.length}.`,
              flowState,
              requiresInput: true,
            };
          }

          const itemToUpdate = summary.items[itemNumber - 1];

          return {
            response: `${itemToUpdate.name} currently has ${itemToUpdate.quantity} copies. Say new quantity from 1 to 10.`,
            flowState: {
              ...flowState,
              step: "collect-new-quantity",
              pendingItemId: itemToUpdate._id,
              pendingItemName: itemToUpdate.name,
              currentQuantity: itemToUpdate.quantity,
            },
            requiresInput: true,
          };
        }

        return {
          response:
            "Say checkout, continue shopping, remove item followed by a number, or clear cart.",
          flowState,
          requiresInput: true,
        };
      }

      case "add-to-cart-init": {
        if (!flowState.bookToAdd) {
          return {
            response:
              "No book selected. Please browse books and select an item first.",
            completed: true,
            requiresInput: false,
          };
        }

        return {
          response: `Adding ${flowState.bookToAdd.name} to cart. How many copies? Say a number from 1 to 10.`,
          flowState: { ...flowState, step: "collect-quantity" },
          requiresInput: true,
        };
      }

      case "collect-quantity": {
        const quantity = extractNumber(userInput);

        if (quantity === null || quantity < 1 || quantity > 10) {
          return {
            response: "Please say a number between 1 and 10.",
            flowState,
            requiresInput: true,
          };
        }

        const copies = quantity === 1 ? "copy" : "copies";
        return {
          response: `Adding ${quantity} ${copies} of ${flowState.bookToAdd.name}. Say yes to confirm, or no to cancel.`,
          flowState: {
            ...flowState,
            step: "confirm-add",
            pendingQuantity: quantity,
          },
          requiresInput: true,
        };
      }

      case "confirm-add": {
        const confirmation = commandParser.parseConfirmation(userInput);

        if (confirmation.confirmed === true) {
          try {
            cartContext.addItem(flowState.bookToAdd, pendingQuantity);
            const summary = cartContext.getCartSummary();

            return {
              response: `Added to cart! Cart now has ${summary.itemCount} items. Say view cart, checkout, or continue shopping.`,
              completed: true,
              requiresInput: false,
              action: "item-added",
            };
          } catch (error) {
            return {
              response: `Failed to add to cart: ${error.message}. Please try again.`,
              flowState: { ...flowState, step: "add-to-cart-init" },
              requiresInput: true,
            };
          }
        } else if (confirmation.confirmed === false) {
          return {
            response: "Cancelled. Say continue shopping to browse books.",
            completed: true,
            requiresInput: false,
          };
        } else {
          return {
            response: "Please say yes to confirm, or no to cancel.",
            flowState,
            requiresInput: true,
          };
        }
      }

      case "confirm-remove": {
        const confirmation = commandParser.parseConfirmation(userInput);

        if (confirmation.confirmed === true) {
          try {
            cartContext.removeItem(pendingItemId);
            const summary = cartContext.getCartSummary();

            if (summary.itemCount === 0) {
              return {
                response:
                  "Removed. Cart is now empty. Say continue shopping to add items.",
                flowState: { ...flowState, step: "empty-cart" },
                requiresInput: true,
              };
            }

            return {
              response: `Removed ${flowState.pendingItemName}. Cart now has ${summary.itemCount} items. Say view cart, checkout, or continue shopping.`,
              flowState: { ...flowState, step: "viewing-cart" },
              requiresInput: true,
            };
          } catch (error) {
            return {
              response: `Failed to remove item: ${error.message}. Please try again.`,
              flowState: { ...flowState, step: "viewing-cart" },
              requiresInput: true,
            };
          }
        } else if (confirmation.confirmed === false) {
          return {
            response: "Cancelled. Item remains in cart.",
            flowState: { ...flowState, step: "viewing-cart" },
            requiresInput: true,
          };
        } else {
          return {
            response: "Please say yes to confirm removal, or no to cancel.",
            flowState,
            requiresInput: true,
          };
        }
      }

      case "confirm-clear": {
        const confirmation = commandParser.parseConfirmation(userInput);

        if (confirmation.confirmed === true) {
          try {
            cartContext.clearCart();
            return {
              response:
                "Cart cleared. All items removed. Say continue shopping to browse books.",
              flowState: { ...flowState, step: "empty-cart" },
              requiresInput: true,
            };
          } catch (error) {
            return {
              response: `Failed to clear cart: ${error.message}. Please try again.`,
              flowState: { ...flowState, step: "viewing-cart" },
              requiresInput: true,
            };
          }
        } else if (confirmation.confirmed === false) {
          return {
            response: "Cancelled. Cart unchanged.",
            flowState: { ...flowState, step: "viewing-cart" },
            requiresInput: true,
          };
        } else {
          return {
            response: "Please say yes to clear cart, or no to cancel.",
            flowState,
            requiresInput: true,
          };
        }
      }

      case "collect-new-quantity": {
        const newQuantity = extractNumber(userInput);

        if (newQuantity === null || newQuantity < 1 || newQuantity > 10) {
          return {
            response: "Please say a number between 1 and 10.",
            flowState,
            requiresInput: true,
          };
        }

        const copies = newQuantity === 1 ? "copy" : "copies";
        return {
          response: `Update ${flowState.pendingItemName} to ${newQuantity} ${copies}? Say yes to confirm, or no to cancel.`,
          flowState: {
            ...flowState,
            step: "confirm-update-quantity",
            pendingQuantity: newQuantity,
          },
          requiresInput: true,
        };
      }

      case "confirm-update-quantity": {
        const confirmation = commandParser.parseConfirmation(userInput);

        if (confirmation.confirmed === true) {
          try {
            cartContext.updateQuantity(pendingItemId, pendingQuantity);
            return {
              response: `Updated! ${flowState.pendingItemName} quantity is now ${pendingQuantity}. Say view cart to see all items.`,
              flowState: { ...flowState, step: "viewing-cart" },
              requiresInput: true,
            };
          } catch (error) {
            return {
              response: `Failed to update quantity: ${error.message}. Please try again.`,
              flowState: { ...flowState, step: "viewing-cart" },
              requiresInput: true,
            };
          }
        } else if (confirmation.confirmed === false) {
          return {
            response: "Cancelled. Quantity unchanged.",
            flowState: { ...flowState, step: "viewing-cart" },
            requiresInput: true,
          };
        } else {
          return {
            response: "Please say yes to confirm, or no to cancel.",
            flowState,
            requiresInput: true,
          };
        }
      }

      default:
        return {
          response: "Something went wrong. Say view cart to start over.",
          completed: true,
          requiresInput: false,
        };
    }
  };
};
