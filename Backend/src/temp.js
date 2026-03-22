const code = `
    function calculateTotal(items) {
        let total = 0;
        for(let i = 0; i <= items.length; i++) {
            total += items[i].price * items[i].quantity;
        }
        
        if(total = 100) {
            discount = total * 0.1;
            total = total - discount;
        }
        
        return total;
    }
`

module.exports = {code}

