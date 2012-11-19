Copper
======

Copper is a Javascript implementation of Composite Oriented Programming.
The idea is that instead of declaring types (classes) and using
inheritance to extend those, you assemble or compose data types
from other objects or types.

In traditional class based languages such as Java you would do
something like this:
```java
public class Person {
    private String name;
    public Person(String name) {
        this.name = name;
    }
    public void sayName() {
        return "My name is " + name;
    }
}

public class Employee extends Person {
    private int employeeNumber;
    public Employee(String name, int employeeNumber) {
        super(name);
        this.employeeNmber = employeeNumber;
    }
    public String sayNumber() {
        return "My number is " + employeeNumber;
    }
}
// Usage
Person p = new Person("John");
System.out.println(p.sayName()); // "My name is John"
Employee emp = new Person("George", 123);
System.out.println(emp.sayName()); // My name is George
System.out.println(emp.sayNumber()); // My number is 123
```

Whereas in a Composite Oriented Programming system, such as Copper
you would do this:

```javascript
var personBehaviour = {
    sayName: function() {
        return 'My name is ' + this.name
    }
}
var employeeBehaviour = {
    sayNumber: function() {
        return 'My number is ' + this.employeeNumber
    }
}
copper.compose({
      name: 'Person'
    , mixins: [
        personBehaviour
    ]
    , create: function(name) {
        this.name = name
    }
})
copper.compose({
      name: 'Employee'
    , mixins: [
          personBehaviour
        , employeeBehaviour
    ]
    , create: function(name, employeeNumber) {
        this.name = name
        this.employeeNumber = employeeNumber
    }
})
var person = copper.create('Person', 'John')
person.sayName()                // My name is John
var emp = copper.create('Employee', 'George', 123)
console.log(emp.sayName())      // My name is George
console.log(emp.sayNumber())    // My number is 123
```

Instead of defining a type (a class), you define the behaviour and then
compose your objects using these behaviours.

But wait! There is more!
------------------------

In addition to mixins, you can add traditional Aspect Oriented Programming
advices to your composed objects. Lets work the employee a little more:

```javascript
copper.compose({
      name: 'Employee'
    , mixins: [
          personBehaviour
        , employeeBehaviour
    ]
    , after: {
        'sayName': function(ret) {
            return ret + ' and my number is ' + this.employeeNumber
        }
    }
    , create: function(name, employeeNumber) {
        this.name = name
        this.employeeNumber = employeeNumber
    }
})
var emp = copper.create('Employee', 'George', 123)
console.log(emp.sayName())      // My name is George and my number is 123
```

Here's what you can do with copper:
```javascript
// Create AND register
var foo = copper.compose({
      name: 'optional name'
    , mixins: [all your mixin objects]
    , before: {method: function}
    , after: {method: function}
    , around: {
        method: function(param1, param2, yield) {
            // Do something
            yield(param1, param2)
            // Do some more
        }
    }
    , create: function() {
        // Optional constructor
    }
})
// Just create
var bar = copper.create({
    // definition MINUS the name
})
var baz = copper.create(name)
copper.mixin(baz, mixin1, mixin2)
copper.before(adviceFunction, baz, 'methodName')
copper.after(adviceFunction, baz, 'methodName')
copper.around(adviceFunction, baz, 'methodName')

```

Have fun!


