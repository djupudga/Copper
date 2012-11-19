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
        System.out.println("My name is " + name)
    }
}

public class Employee extends Person {
    private int employeeNumber;
    public Employee(String name, int employeeNumber) {
        super(name);
        this.employeeNmber = employeeNumber;
    }
    public String sayNumber() {
        System.out.println("My number is " + employeeNumber);
    }
}
// Usage
Person p = new Person("John");
p.sayName(); // "My name is John"
Employee emp = new Person("George", 123);
emp.sayName(); // My name is George
emp.sayNumber(); // My number is 123
```

Whereas in a Composite Oriented Programming system, such as Copper
you would do this:

```javascript
var personBehaviour = {
    sayName: function() {
        console.log('My name is ' + this.name)
    }
}
var employeeBehaviour = {
    sayNumber: function() {
        console.log('My number is ' + this.employeeNumber)
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
person.sayName()    // My name is John
var emp = copper.create('Employee', 'George', 123)
emp.sayName()       // My name is George
emp.sayNumber()      // My number is 123
```

Instead of defining a type (a class), you define the behaviour and then
compose your objects using these behaviours.



