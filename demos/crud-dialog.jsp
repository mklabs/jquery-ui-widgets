<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
	pageEncoding="ISO-8859-1" isELIgnored="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jstl/fmt" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<form:form 
	id="wt-event-form-test-case"
	commandName="eventForm" 
	action="/weekly/event/save/" 
	cssClass="_hover:dialog:form:testCase.js">
	<form:hidden path="id"/>
	<ul>
		<li>
			<span>Date: </span>
			<c:out value="${eventForm.start}" />
		</li>
		<li>
			<label for="start">Start Time: </label>
			<form:select path="start" items="${timeList}" itemLabel="label" itemValue="value" />
		</li>
		<li>
			<label for="end">End Time: </label>
			<form:select path="end" items="${timeList}" itemLabel="label" itemValue="value" />
		</li>
		<li>
			<label for="title">Title: </label>
			<form:input path="title" />
		</li>
		<li>
			<label for="body">Body: </label>
			<form:textarea path="body" />
		</li>
	</ul>
	
	<div class="ui-widget-header ui-corner-all" style="float: right; width: auto; padding: 0.3em; margin: 2em;">
		<a class="cmd-save ui-state-default ui-corner-all">Save</button>
		<a class="cmd-cancel ui-state-default ui-corner-all">Cancel</button>
	</div>
</form:form>