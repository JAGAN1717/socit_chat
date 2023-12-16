


const test = () => {

   
    let getLength = function (str) {
        let finalLength = 0;
      
        for (let i = 0; i < str.length; i++) {
          let currentString = new Set();
      
          for (let j = i; j < str.length; j++) {
            // if (currentString.has(str[j])) {
            //   break;
            // } else {
            //   currentString.add(str[j]);
            // }
            currentString.add(str[j]);
          }
      
          finalLength = Math.max(finalLength, currentString.size);
        }
      
        return finalLength;
      };
      
      const str = "abbbcabcdefef";
      let currentString = new Set();
      currentString.add(str[0])
      currentString.add(str[1])
      let currentStrings = [];
      const currentCharacterIndex = str.indexOf('a');
      let arr = [2, "b", 4, "d", 3, "a", "c", "e", 5, 1];

      const number = arr.filter(e => typeof e === 'number' )
      const string = arr.filter(e => typeof e === 'string' )
      const result = [...number.sort(),...string.sort()] 

      let m = [ [0, 1, 2], [3, 4, 5], [6, 7, 8], ];

    //   [
    //     [0, 3, 6],6,3,0
    //     [1, 4, 7],7,4,1
    //     [2, 5, 8],8,5,2
    //   ];  
      
    const clockWise = (mat) => {
        for (let r = 0; r < mat.length; r++) { 
            for (let c = 0; c < r; c++) {
                console.log("temp",  mat[c][r]);
                let temp = mat[r][c];
            mat[r][c] = mat[c][r]; 
            mat[c][r] = temp; 
          }
        }
        // reverse the m of each array
        let finalMat = mat.map((r) => r.reverse());
      
        return finalMat;
      };

     let a = [{id:1},{id:2},{id:3},{id:4},{id:5}] 

    
    // const arr2 = [0, 1, [2, [3, [4, 5]]]];
    
    // console.log("text",arr2.flat(Infinity).flatMap(num => num == 4 ? 0:num));
    
    //  for(key of a.keys()){
    //      console.log('key',key)
    //  }

}

module.exports = {test}