// This is a Tailwind CSS configuration file that customizes the default theme.
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{html,js,ts,jsx,tsx}",
    ],
    theme: {
        screens: {
            'xs': '320px',
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
          
        },
       
        extend: {
           
            fontSize: {
                '12': '12px',
                '14': '14px',
                '16': '16px'

            },
            fontWeight: {
                '400': 400,
                '700': 700,
            },
            height: {
                '14':'14px',
                '16':'16px',
                '18': '18px',
                '20': '20px',
                '24': '24px',
                '30': '30px',
                '32': '32px',
                '40': '40px',
                '42': '42px',
                '58': '58px',
                '116': '116px',
                '133':'133px',
                '140': '140px',
            },
            width: {
                '14':'14px',
                '16':'16px',
                '140': '140px',
                
                '206': '206px',
                '236':'236px',
                '385': '385px',
                '395': '395px',
                '422':'422px',
                '1233': '1233px',
            },
            padding: {
                '24': '24px',
                
                '30': '30px',
                '5': '5px',
                '8':'8px',
                '10': '10px',
                '14': '14px',
                

            },
            borderWidth: {
                'custom-bottom': '1px',
            },
            borderColor: {
                'ga3': 'var(--Ga3)',
            },
            margin:{
                '5': '5px',
                '10': '10px',
                '15': '15px',
                '20': '20px',
                '30': '30px',
                '34': '34px',
                '40': '40px',
            },
            lineHeight:{
                '16': '16px',
                '20': '20px',
                '24': '24px',
                '40': '40px',
                // '30px': '30px', 
                // '38px':'38px',
            },
            bottom:{
                // '6px': '6px',
            },
           
        }
    },
    plugins: [
        function ({ addUtilities }) {
            addUtilities({
                '.no-wrap': {
                    'white-space': 'nowrap'
                }
            })
        },
       
    ],
    
};