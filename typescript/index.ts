// console.log("hello")


// //2
// const a: number = 123;
// console.log(a) 

// //3
// //array: fixed type but not the length
// const b: number[]= [1,2];
// //b.push("world") // error
// b.push(3);
// b.push(12);
// console.log(b)

// //4
// //tuple = fixed sice and type
// const c: [number,number,number]= [1,2,3];
// const d: [number,string,number]= [1,2,3];// error
// console.log(c)

// //5
// //jab tk function kuch return ni krta tb tk uska return type rehta h void
// function greet(name:string): void{
//     console.log("hello" + name)
// }
// greet('cohert')


// //6
// function greet(name:string): string{
//     return "hello" + name
// }

// greet ('cohort')


// //7
// // jab function khtm hi ni ho rha hota tb hum never ka use krte h
// function greet(name:string): never{
//     throw new Error("something went wrong")
// }

// //7
// const user ={
//     name:"test",
//     age:32,
//     isMale: true
// }


// function greet(data:{name:string, age:number, isMale: boolean}){
//     console.log("hello" + data.name + "your age is" + data.age)
// }
// greet(user)



// //8
// type USER ={name:string, age:number, isMale: boolean}
// const person: USER ={
//     name:"test",
//     age:32,
//     isMale: true
// }
// function greet(data:USER): void{
//     console.log("hello" + data.name + "your age is" + data.age)
// }
// greet(user)



//any= 

// let a:any
// a="hello";
// console.log(a.toUpperCase())



// let a:any
// a=123;
// console.log(a.toUpperCase()) // error



let a: unknown

a=123

if((typeof a) === "string")
    console.log(a.toUpperCase())


