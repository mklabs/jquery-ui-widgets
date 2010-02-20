<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
	pageEncoding="ISO-8859-1" isELIgnored="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
		<link rel='stylesheet' type='text/css' href='http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/ui-lightness/jquery-ui.css' />
		<link rel='stylesheet' type='text/css' href='./css/wt.main.css' />
		<title>Weekly Task JSP!!</title>
	</head>
	<body class="ui-widget ui-widget-content">
			
		<div class="ui-layout-north">
			<h1 id="wt-header-title" class="ui-widget-header">Weekly task JSP</h1>
			<div id="wt-userinfo" class="ui-widget-content">
			</div>
			<div id="wt-switcher"></div>
		</div>
		
		<div id="wt-controller-example-crud-table" class="_load:example:crud:table.js">
			<input type="hidden" name="dto.start" value="<c:out value="${start}" />" />
			<input type="hidden" name="dto.end" value="<c:out value="${end}" />" />
			
			<h2>Simple use case</h2>
			<div class="ui-widget-header ui-corner-all" style="float: right; width: 300px; padding: 0.3em; margin: 2em;">
				<button class="cmd-add ui-state-default ui-corner-all">Ajouter</button>
				<button class="cmd-edit ui-state-default ui-corner-all">Modifier</button>
				<button class="cmd-remove ui-state-default ui-corner-all">Supprimer</button>
				
				<button class="_click:extendedController.js cmd-play ui-state-default ui-corner-all" style="margin-left: 1em;">Play</button>
			</div>
			
			<table style="width: 90%; margin: auto;">
				<caption class="ui-widget-header ui-corner-top">Event DTO List</caption>
				<thead  class="ui-widget-header">
					<tr>
						<th>id</th>
						<th>start</th>
						<th>end</th>
						<th>title</th>
						<th>body</th>
					</tr>
				</thead>
				<tfoot class="ui-widget-header ui-corner-bottom">
					<tr>
						<td></td>
						<td></td>
						<td></td>
						<td></td>
					</tr>
				</tfoot>
				<tbody style="text-align: center;">
					<c:forEach var="dto" items="${list}" >
						<tr class="ui-widget-content">
							<td><c:out value="${dto.id}" /></td>
							<td><c:out value="${dto.start}" /></td>
							<td><c:out value="${dto.end}" /></td>
							<td><c:out value="${dto.title}" /></td>
							<td><c:out value="${dto.body}" /></td>
						</tr>
					</c:forEach>
				</tbody>
			</table>
		</div>
		
		<script type="text/javascript" src="./external/DUI.js"></script>
		<script type="text/javascript">
		(function(){
		    var Constants = {
		        SWITCHER_SEL: "#wt-switcher"
		    };
			
		    // Setup DUI
		    DUI.scriptURL = "/js/src/";
			
			// Setup console case not defined
			if(typeof console === "undefined"){
				this.console = {};
				this.console.log = function(){};
				this.console.info = function(){};
				this.console.debug = function(){};
				this.console.warn = function(){};
				this.console.error = function(){};
			}
		    
		    // ThemeRoller demo
		    DUI(["plugin/themeswitcher.js"], function(){
		        $(Constants.SWITCHER_SEL).themeswitcher();
		    })
		})();
		</script>
	</body>
</html>	