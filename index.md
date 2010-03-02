---
title: Home
layout: wikistyle
---
jQuery-UI-Controller
====================
A jQuery UI Widget that provides you clean and handy way to organize your jQuery code. 
Controllers organize event handlers through the power of event delegation. If something happens 
in your application, either it is browser event or custom ones, a controller should respond to it.

*Controllers let you know where your code is!
*Controllers force you to group events and label your html in specific ways.
*Controllers are inheritable.
*Controllers use event delegation.


Key concepts
---------------------
Mosf of the purpose of this widget is to try to implement key concept's from Nicholas C. Zakas' great presentation.

(http://developer.yahoo.com/yui/theater/video.php?v=zakas-architecture)[Nicholas C. Zakas — Scalable JavaScript Application Architecture]

Without going as far as Nicolas advise us to do so, the idea of core / application / core / module is omnipresent in this widget proposal.
*Base Library: jQuery.
*Application Core: jQuery UI Widget Factory, through the Controller widget.
*Sandbox: Passed as a parameter in every controller entry point. Responsible for example of controller communication (read module in Nicolas' video).
*Modules: Controllers in our terminology.


This widget proposal is more like a playground for me and experience in trying to implement those key concepts in a jQuery / jQuery UI environment.
