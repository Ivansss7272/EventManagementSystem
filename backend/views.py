@app.route('/events/bulk', methods=['POST'])
@token_required
def create_multiple_events(current_user):
    data = request.get_json()
    events = [Event(
        title=event_data['title'],
        description=event_data.get('description', ""),
        date=datetime.strptime(event_data['date'], '%Y-%m-%d'),
        organizer_id=current_user.id
    ) for event_data in data['events']]
    
    db.session.add_all(events)
    db.session.commit()
    
    return jsonify({'message': f'{len(events)} events created successfully'}), 201